using HtmlAgilityPack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RozgarHub.Api.Data;
using RozgarHub.Api.Models;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace RozgarHub.Api.Services;

public class ScraperService : IScraperService
{
    private static readonly SemaphoreSlim SyncLock = new(1, 1);
    private static DateTime LastSyncUtc = DateTime.MinValue;
    private readonly AppDbContext _db;
    private readonly HttpClient _http;
    private readonly ILogger<ScraperService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public ScraperService(
        AppDbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<ScraperService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _http = httpClientFactory.CreateClient();
        _http.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 RozgarHub Bot");
        _http.Timeout = TimeSpan.FromSeconds(15);
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    public bool TryStartBackgroundRefresh(bool force = false)
    {
        var shouldSync = force || DateTime.UtcNow - LastSyncUtc > TimeSpan.FromMinutes(5);
        if (!shouldSync) return false;
        if (!SyncLock.Wait(0)) return false;

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedScraper = scope.ServiceProvider.GetRequiredService<IScraperService>();
                await scopedScraper.SyncAllSources();
                LastSyncUtc = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Background refresh failed");
            }
            finally
            {
                SyncLock.Release();
            }
        });

        return true;
    }

    public SyncStatus GetSyncStatus()
    {
        var nowUtc = DateTime.UtcNow;
        var nextAllowedSyncAt = LastSyncUtc + TimeSpan.FromMinutes(5);
        var cooldownSecondsRemaining = nextAllowedSyncAt > nowUtc
            ? (int)Math.Ceiling((nextAllowedSyncAt - nowUtc).TotalSeconds)
            : 0;

        return new SyncStatus
        {
            IsRunning = SyncLock.CurrentCount == 0,
            LastSyncUtc = LastSyncUtc == DateTime.MinValue ? null : LastSyncUtc,
            CooldownSecondsRemaining = cooldownSecondsRemaining
        };
    }

    public async Task RefreshIfNeeded(bool force = false)
    {
        var shouldSync = force || DateTime.UtcNow - LastSyncUtc > TimeSpan.FromMinutes(5);
        if (!shouldSync) return;

        await SyncLock.WaitAsync();
        try
        {
            shouldSync = force || DateTime.UtcNow - LastSyncUtc > TimeSpan.FromMinutes(5);
            if (!shouldSync) return;
            await SyncAllSources();
            LastSyncUtc = DateTime.UtcNow;
        }
        finally
        {
            SyncLock.Release();
        }
    }

    public async Task ScrapeFPSC()
    {
        try
        {
            _logger.LogInformation("Starting FPSC scrape...");
            var html = await TryGetHtmlFromUrls(
                "https://www.fpsc.gov.pk/jobs",
                "https://www.fpsc.gov.pk/");
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // FPSC ki table se jobs nikalna - selector change ho sakta hai site update pe
            var rows = doc.DocumentNode.SelectNodes("//table//tr");
            if (rows == null) return;

            int count = 0;
            foreach (var row in rows.Skip(1)) // Skip header
            {
                var cells = row.SelectNodes("td");
                if (cells == null || cells.Count < 3) continue;

                var title = cells[1].InnerText.Trim();
                var dateText = cells[2].InnerText.Trim();

                if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(dateText)) continue;

                // Date parse karo
                if (!DateTime.TryParse(dateText, out var lastDate)) continue;
                if (lastDate < DateTime.Now) continue; // Expired skip

                var slug = Regex.Replace(title.ToLower(), @"[^a-z0-9]+", "-").Trim('-');

                // Duplicate check
                if (await _db.Jobs.AnyAsync(j => j.Slug == slug)) continue;

                var job = new Job
                {
                    Title = title,
                    Slug = slug,
                    Category = "govt-pk",
                    Country = "Pakistan",
                    Department = "FPSC",
                    LastDate = lastDate,
                    Salary = "As per Govt Scale",
                    VisaSponsored = false,
                    ApplyLink = "https://www.fpsc.gov.pk/apply",
                    Description = BuildJobDescription(
                        title,
                        "FPSC",
                        $"Announced by Federal Public Service Commission. Last date: {lastDate:dd MMM yyyy}.",
                        null),
                    Source = "FPSC",
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Jobs.Add(job);
                count++;
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation($"FPSC scrape done. {count} new jobs added.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FPSC scraping failed");
        }
    }

    public Task ScrapePPSC() => ScrapeGovtPortalLinks(
        "https://www.ppsc.gop.pk/(S(ew0m4fzw5vmei5nm0wguzxq3))/Jobs.aspx",
        "PPSC",
        "Punjab Public Service Commission");

    public Task ScrapeSPSC() => ScrapeGovtPortalLinks(
        "http://www.spsc.gov.pk/",
        "SPSC",
        "Sindh Public Service Commission");

    public Task ScrapeKPPSC() => ScrapeGovtPortalLinks(
        "https://kppsc.gov.pk/",
        "KPPSC",
        "Khyber Pakhtunkhwa Public Service Commission");

    public Task ScrapeNTS() => ScrapeGovtPortalLinks(
        "https://www.nts.org.pk/new/",
        "NTS",
        "National Testing Service");

    public async Task ScrapeNaukriGulf()
    {
        try
        {
            _logger.LogInformation("Starting NaukriGulf scrape...");
            var html = await _http.GetStringAsync("https://www.naukrigulf.com/pakistan-jobs");
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var jobCards = doc.DocumentNode.SelectNodes("//div[contains(@class,'jobTuple')]");
            if (jobCards == null) return;

            int count = 0;
            foreach (var card in jobCards.Take(20)) // Top 20 jobs
            {
                var titleNode = card.SelectSingleNode(".//a[contains(@class,'title')]");
                var companyNode = card.SelectSingleNode(".//a[contains(@class,'company')]");
                
                if (titleNode == null) continue;

                var title = titleNode.InnerText.Trim();
                var company = companyNode?.InnerText.Trim()?? "Gulf Company";
                var link = titleNode.GetAttributeValue("href", "");

                var slug = Regex.Replace(title.ToLower(), @"[^a-z0-9]+", "-").Trim('-') + "-dubai";

                if (await _db.Jobs.AnyAsync(j => j.Slug == slug)) continue;

                var job = new Job
                {
                    Title = title,
                    Slug = slug,
                    Category = "international",
                    Country = "UAE",
                    Department = company,
                    LastDate = DateTime.Now.AddDays(30), // NaukriGulf date nahi deta, 30 din default
                    Salary = "Competitive",
                    VisaSponsored = true,
                    ApplyLink = link.StartsWith("http")? link : $"https://www.naukrigulf.com{link}",
                    Description = BuildJobDescription(
                        title,
                        "NaukriGulf",
                        $"Role at {company} in UAE. Visa support may be offered.",
                        null),
                    Source = "NaukriGulf",
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Jobs.Add(job);
                count++;
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation($"NaukriGulf scrape done. {count} new jobs added.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NaukriGulf scraping failed");
        }
    }

    public async Task ScrapeHECScholarships()
    {
        try
        {
            _logger.LogInformation("Starting HEC scholarships scrape...");
            var html = await _http.GetStringAsync("https://www.hec.gov.pk/english/scholarshipsgrants/pages/default.aspx");
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var links = doc.DocumentNode.SelectNodes("//a[@href]");
            if (links == null) return;

            int count = 0;
            foreach (var linkNode in links)
            {
                var title = HtmlEntity.DeEntitize(linkNode.InnerText).Trim();
                if (string.IsNullOrWhiteSpace(title) || title.Length < 8) continue;

                var lower = title.ToLower();
                if (!lower.Contains("scholar") && !lower.Contains("fellowship") && !lower.Contains("grant"))
                    continue;

                var href = linkNode.GetAttributeValue("href", string.Empty);
                if (string.IsNullOrWhiteSpace(href)) continue;

                var applyLink = href.StartsWith("http")
                    ? href
                    : $"https://www.hec.gov.pk{(href.StartsWith("/") ? string.Empty : "/")}{href}";

                var slug = Slugify(title);
                if (await _db.Scholarships.AnyAsync(s => s.Slug == slug)) continue;

                var scholarship = new Scholarship
                {
                    Title = title,
                    Slug = slug,
                    Provider = "HEC Pakistan",
                    Country = "Pakistan",
                    Level = "Mixed",
                    Deadline = DateTime.Now.AddDays(45),
                    FundingType = "Partially/ Fully Funded",
                    ApplyLink = applyLink,
                    Description = $"{title} listed by HEC. Please verify latest eligibility and deadline on official page.",
                    Source = "HEC",
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Scholarships.Add(scholarship);
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("HEC scholarships scrape done. {Count} new scholarships added.", count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "HEC scholarships scraping failed");
        }
    }

    public async Task ScrapeRemotiveJobs()
    {
        try
        {
            _logger.LogInformation("Starting Remotive jobs sync...");
            var payload = await _http.GetStringAsync("https://remotive.com/api/remote-jobs");
            var response = JsonSerializer.Deserialize<RemotiveResponse>(payload, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (response?.Jobs == null || response.Jobs.Count == 0) return;

            var seenSlugs = await GetExistingJobSlugsBySource("Remotive");
            var count = 0;
            foreach (var item in response.Jobs.Take(60))
            {
                if (string.IsNullOrWhiteSpace(item.Title) || string.IsNullOrWhiteSpace(item.Url))
                    continue;

                var slug = $"{Slugify(item.Title)}-remotive";
                if (!seenSlugs.Add(slug)) continue;

                var location = string.IsNullOrWhiteSpace(item.CandidateRequiredLocation)
                    ? "International"
                    : item.CandidateRequiredLocation;
                var isGulf = IsGulfLocation(location);

                var job = new Job
                {
                    Title = item.Title.Trim(),
                    Slug = slug,
                    Category = isGulf ? "international" : "private-pk",
                    Country = isGulf ? "UAE" : "International",
                    Department = string.IsNullOrWhiteSpace(item.CompanyName) ? "Private Company" : item.CompanyName.Trim(),
                    LastDate = DateTime.Now.AddDays(30),
                    Salary = "As per company policy",
                    VisaSponsored = isGulf,
                    ApplyLink = item.Url,
                    Description = BuildJobDescription(
                        item.Title,
                        "Remotive",
                        $"Remote job listed on Remotive for {(string.IsNullOrWhiteSpace(item.CompanyName) ? "Private Company" : item.CompanyName.Trim())}.",
                        item.Description),
                    Source = "Remotive",
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Jobs.Add(job);
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("Remotive sync done. {Count} new jobs added.", count);
        }
        catch (Exception ex)
        {
            _db.ChangeTracker.Clear();
            _logger.LogError(ex, "Remotive jobs sync failed");
        }
    }

    public async Task ScrapeArbeitnowJobs()
    {
        try
        {
            _logger.LogInformation("Starting Arbeitnow jobs sync...");
            var payload = await _http.GetStringAsync("https://www.arbeitnow.com/api/job-board-api");
            var response = JsonSerializer.Deserialize<ArbeitnowResponse>(payload, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (response?.Data == null || response.Data.Count == 0) return;

            var seenSlugs = await GetExistingJobSlugsBySource("Arbeitnow");
            var count = 0;
            foreach (var item in response.Data.Take(60))
            {
                if (string.IsNullOrWhiteSpace(item.Title) || string.IsNullOrWhiteSpace(item.Url))
                    continue;

                var slug = $"{Slugify(item.Title)}-arbeitnow";
                if (!seenSlugs.Add(slug)) continue;

                var location = string.IsNullOrWhiteSpace(item.Location) ? "International" : item.Location;
                var isGulf = IsGulfLocation(location);

                var job = new Job
                {
                    Title = item.Title.Trim(),
                    Slug = slug,
                    Category = isGulf ? "international" : "private-pk",
                    Country = isGulf ? "UAE" : "International",
                    Department = string.IsNullOrWhiteSpace(item.CompanyName) ? "Private Company" : item.CompanyName.Trim(),
                    LastDate = DateTime.Now.AddDays(30),
                    Salary = "As per company policy",
                    VisaSponsored = isGulf,
                    ApplyLink = item.Url,
                    Description = BuildJobDescription(
                        item.Title,
                        "Arbeitnow",
                        $"Remote job listed on Arbeitnow for {(string.IsNullOrWhiteSpace(item.CompanyName) ? "Private Company" : item.CompanyName.Trim())}.",
                        item.Description),
                    Source = "Arbeitnow",
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Jobs.Add(job);
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("Arbeitnow sync done. {Count} new jobs added.", count);
        }
        catch (Exception ex)
        {
            _db.ChangeTracker.Clear();
            _logger.LogError(ex, "Arbeitnow jobs sync failed");
        }
    }

    public async Task ScrapeRemoteOkJobs()
    {
        try
        {
            _logger.LogInformation("Starting RemoteOK jobs sync...");
            var payload = await _http.GetStringAsync("https://remoteok.com/api");
            var response = JsonSerializer.Deserialize<List<RemoteOkJob>>(payload, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (response == null || response.Count == 0) return;

            var seenSlugs = await GetExistingJobSlugsBySource("RemoteOK");
            var count = 0;

            foreach (var item in response.Take(100))
            {
                if (string.IsNullOrWhiteSpace(item.Position) || string.IsNullOrWhiteSpace(item.Url))
                    continue;

                var slug = $"{Slugify(item.Position)}-remoteok";
                if (!seenSlugs.Add(slug)) continue;

                var location = string.IsNullOrWhiteSpace(item.Location) ? "International" : item.Location;
                var isGulf = IsGulfLocation(location);

                _db.Jobs.Add(new Job
                {
                    Title = item.Position.Trim(),
                    Slug = slug,
                    Category = isGulf ? "international" : "private-pk",
                    Country = isGulf ? "UAE" : "International",
                    Department = string.IsNullOrWhiteSpace(item.Company) ? "Remote Company" : item.Company.Trim(),
                    LastDate = DateTime.Now.AddDays(30),
                    Salary = "As per company policy",
                    VisaSponsored = isGulf,
                    ApplyLink = item.Url,
                    Description = BuildJobDescription(
                        item.Position,
                        "RemoteOK",
                        $"Remote job listed on RemoteOK for {(string.IsNullOrWhiteSpace(item.Company) ? "Remote Company" : item.Company.Trim())}.",
                        item.Description),
                    Source = "RemoteOK",
                    PostedDate = DateTime.Now,
                    IsActive = true
                });
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("RemoteOK sync done. {Count} new jobs added.", count);
        }
        catch (Exception ex)
        {
            _db.ChangeTracker.Clear();
            _logger.LogError(ex, "RemoteOK jobs sync failed");
        }
    }

    private async Task ScrapeGovtPortalLinks(string url, string source, string department)
    {
        try
        {
            _logger.LogInformation("Starting {Source} scrape...", source);
            var html = await _http.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            var links = doc.DocumentNode.SelectNodes("//a[@href]");
            if (links == null) return;

            var existingSlugs = await _db.Jobs
                .AsNoTracking()
                .Where(j => j.Source == source)
                .Select(j => j.Slug)
                .ToListAsync();
            var existingLinks = await _db.Jobs
                .AsNoTracking()
                .Where(j => j.Source == source)
                .Select(j => j.ApplyLink)
                .ToListAsync();
            var seenSlugs = existingSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
            var seenLinks = existingLinks.ToHashSet(StringComparer.OrdinalIgnoreCase);
            var count = 0;
            foreach (var node in links.Take(250))
            {
                var title = HtmlEntity.DeEntitize(node.InnerText).Trim();
                if (title.Length < 10) continue;

                var lowered = title.ToLower();
                // Skip noisy navigation and non-vacancy pages.
                if (lowered.Contains("archive") ||
                    lowered.Contains("job description") ||
                    lowered.Contains("syllabus") ||
                    lowered.Contains("result") ||
                    lowered.Contains("answer key") ||
                    lowered.Contains("admit card") ||
                    lowered.Contains("interview") ||
                    lowered.Contains("schedule") ||
                    lowered.Contains("test") ||
                    lowered.Contains("roll no") ||
                    lowered.Contains("important notice") ||
                    lowered.Contains("login"))
                {
                    continue;
                }

                if (!lowered.Contains("job") &&
                    !lowered.Contains("vacanc") &&
                    !lowered.Contains("advertisement") &&
                    !lowered.Contains("post") &&
                    !lowered.Contains("career"))
                {
                    continue;
                }

                var href = node.GetAttributeValue("href", string.Empty);
                if (string.IsNullOrWhiteSpace(href)) continue;
                if (!Uri.TryCreate(new Uri(url), href, out var absoluteUri)) continue;
                var absoluteLink = absoluteUri.ToString();
                if (!seenLinks.Add(absoluteLink)) continue;

                var slug = $"{Slugify(title)}-{Slugify(source)}";
                if (!seenSlugs.Add(slug)) continue;

                _db.Jobs.Add(new Job
                {
                    Title = title,
                    Slug = slug,
                    Category = "govt-pk",
                    Country = "Pakistan",
                    Department = department,
                    LastDate = DateTime.Now.AddDays(21),
                    Salary = "As per advertisement",
                    VisaSponsored = false,
                    ApplyLink = absoluteLink,
                    Description = BuildJobDescription(
                        title,
                        source,
                        $"Published by {department}. Verify latest last date on official source.",
                        null),
                    Source = source,
                    PostedDate = DateTime.Now,
                    IsActive = true
                });
                count++;
            }

            if (count > 0) await _db.SaveChangesAsync();
            _logger.LogInformation("{Source} scrape done. {Count} new jobs added.", source, count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Source} scraping failed", source);
        }
    }

    private async Task ScrapeScholarshipsFromRss(string url, string sourceName, string country, string level)
    {
        try
        {
            var xml = await _http.GetStringAsync(url);
            var doc = XDocument.Parse(xml);

            var items = doc.Descendants("item").ToList();
            if (items.Count == 0) return;

            var seenSlugs = await GetExistingScholarshipSlugsBySource(sourceName);
            var count = 0;
            foreach (var item in items.Take(60))
            {
                var title = item.Element("title")?.Value?.Trim();
                var link = item.Element("link")?.Value?.Trim();
                var description = item.Element("description")?.Value?.Trim();

                if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(link))
                    continue;

                var slug = $"{Slugify(title)}-{Slugify(sourceName)}";
                if (!seenSlugs.Add(slug)) continue;

                var scholarship = new Scholarship
                {
                    Title = title,
                    Slug = slug,
                    Provider = sourceName,
                    Country = country,
                    Level = level,
                    Deadline = DateTime.Now.AddDays(45),
                    FundingType = "Partially/ Fully Funded",
                    ApplyLink = link,
                    Description = string.IsNullOrWhiteSpace(description)
                        ? $"{title} published by {sourceName}."
                        : StripHtml(description),
                    Source = sourceName,
                    PostedDate = DateTime.Now,
                    IsActive = true
                };

                _db.Scholarships.Add(scholarship);
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("{Source} RSS sync done. {Count} new scholarships added.", sourceName, count);
        }
        catch (Exception ex)
        {
            _db.ChangeTracker.Clear();
            _logger.LogError(ex, "{Source} RSS sync failed", sourceName);
        }
    }

    private async Task ScrapeJobsFromRss(string url, string sourceName, string country, string category)
    {
        try
        {
            var xml = await _http.GetStringAsync(url);
            var doc = XDocument.Parse(xml);

            var items = doc.Descendants("item").ToList();
            if (items.Count == 0) return;

            var seenSlugs = await GetExistingJobSlugsBySource(sourceName);
            var count = 0;

            foreach (var item in items.Take(80))
            {
                var title = item.Element("title")?.Value?.Trim();
                var link = item.Element("link")?.Value?.Trim();
                var description = item.Element("description")?.Value?.Trim();
                if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(link))
                    continue;

                var slug = $"{Slugify(title)}-{Slugify(sourceName)}";
                if (!seenSlugs.Add(slug)) continue;

                _db.Jobs.Add(new Job
                {
                    Title = title,
                    Slug = slug,
                    Category = category,
                    Country = country,
                    Department = sourceName,
                    LastDate = DateTime.Now.AddDays(30),
                    Salary = "As per company policy",
                    VisaSponsored = false,
                    ApplyLink = link,
                    Description = BuildJobDescription(
                        title,
                        sourceName,
                        $"Listed via {sourceName} feed.",
                        description),
                    Source = sourceName,
                    PostedDate = DateTime.Now,
                    IsActive = true
                });
                count++;
            }

            if (count > 0)
                await _db.SaveChangesAsync();

            _logger.LogInformation("{Source} RSS jobs sync done. {Count} new jobs added.", sourceName, count);
        }
        catch (Exception ex)
        {
            _db.ChangeTracker.Clear();
            _logger.LogError(ex, "{Source} RSS jobs sync failed", sourceName);
        }
    }

    public async Task SyncAllSources()
    {
        await ScrapeFPSC();
        await ScrapePPSC();
        await ScrapeSPSC();
        await ScrapeKPPSC();
        await ScrapeNTS();
        await ScrapeNaukriGulf();
        await ScrapeRemotiveJobs();
        await ScrapeArbeitnowJobs();
        await ScrapeRemoteOkJobs();
        await ScrapeJobsFromRss("https://weworkremotely.com/remote-jobs.rss", "WeWorkRemotely", "International", "private-pk");
        await EnsureJobCategoryFallbacks();
        await ScrapeHECScholarships();
        await ScrapeScholarshipsFromRss("https://www.scholars4dev.com/feed/", "Scholars4Dev", "International", "Mixed");
        await ScrapeScholarshipsFromRss("https://opportunitiescorners.com/feed/", "Opportunities Corners", "International", "Mixed");
        await ScrapeScholarshipsFromRss("https://www.afterschoolafrica.com/feed/", "AfterSchoolAfrica", "International", "Mixed");
        await EnsureScholarshipFallbacks();
    }

    private static string Slugify(string value)
    {
        return Regex.Replace(value.ToLower(), @"[^a-z0-9]+", "-").Trim('-');
    }

    private static bool IsGulfLocation(string location)
    {
        return location.Contains("UAE", StringComparison.OrdinalIgnoreCase)
               || location.Contains("Dubai", StringComparison.OrdinalIgnoreCase)
               || location.Contains("Saudi", StringComparison.OrdinalIgnoreCase)
               || location.Contains("Qatar", StringComparison.OrdinalIgnoreCase)
               || location.Contains("Gulf", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<HashSet<string>> GetExistingJobSlugsBySource(string source)
    {
        var slugs = await _db.Jobs
            .AsNoTracking()
            .Where(j => j.Source == source)
            .Select(j => j.Slug)
            .ToListAsync();
        return slugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private async Task<HashSet<string>> GetExistingScholarshipSlugsBySource(string source)
    {
        var slugs = await _db.Scholarships
            .AsNoTracking()
            .Where(s => s.Source == source)
            .Select(s => s.Slug)
            .ToListAsync();
        return slugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static string StripHtml(string value)
    {
        var withoutHtml = Regex.Replace(value, "<.*?>", " ");
        var deEntitized = HtmlEntity.DeEntitize(withoutHtml);
        return Regex.Replace(deEntitized, @"\s+", " ").Trim();
    }

    private static string BuildJobDescription(string title, string source, string fallbackSummary, string? rawDescription)
    {
        var cleaned = string.IsNullOrWhiteSpace(rawDescription) ? string.Empty : StripHtml(rawDescription);
        if (cleaned.Length > 420)
        {
            cleaned = $"{cleaned[..420].TrimEnd()}...";
        }

        var summary = string.IsNullOrWhiteSpace(cleaned) ? fallbackSummary : cleaned;
        return $"{title}. {summary} Source: {source}.";
    }

    private async Task<string> TryGetHtmlFromUrls(params string[] urls)
    {
        foreach (var url in urls)
        {
            try
            {
                return await _http.GetStringAsync(url);
            }
            catch
            {
                // Try next URL in fallback chain.
            }
        }

        throw new HttpRequestException("All source URLs failed.");
    }

    public async Task EnsureScholarshipFallbacks()
    {
        var hasAnyScholarship = await _db.Scholarships.AnyAsync(s => s.IsActive && s.Deadline.Date >= DateTime.Today);
        if (hasAnyScholarship) return;

        var fallbackScholarships = new List<Scholarship>
        {
            new()
            {
                Title = "HEC Overseas Scholarships - Pakistan",
                Slug = "hec-overseas-scholarships-pakistan-fallback",
                Provider = "HEC Pakistan",
                Country = "Pakistan",
                Level = "Masters/PhD",
                Deadline = DateTime.Now.AddDays(60),
                FundingType = "Fully Funded",
                ApplyLink = "https://www.hec.gov.pk/english/scholarshipsgrants/Pages/default.aspx",
                Description = "Official HEC scholarships and grant opportunities for Pakistani students.",
                Source = "HEC",
                PostedDate = DateTime.Now,
                IsActive = true
            },
            new()
            {
                Title = "DAAD Scholarships in Germany",
                Slug = "daad-scholarships-germany-fallback",
                Provider = "DAAD",
                Country = "Germany",
                Level = "Masters/PhD",
                Deadline = DateTime.Now.AddDays(75),
                FundingType = "Partially/ Fully Funded",
                ApplyLink = "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
                Description = "Find official DAAD scholarship database for international students.",
                Source = "DAAD",
                PostedDate = DateTime.Now,
                IsActive = true
            },
            new()
            {
                Title = "Chevening Scholarships (UK)",
                Slug = "chevening-scholarships-uk-fallback",
                Provider = "Chevening",
                Country = "United Kingdom",
                Level = "Masters",
                Deadline = DateTime.Now.AddDays(80),
                FundingType = "Fully Funded",
                ApplyLink = "https://www.chevening.org/scholarships/",
                Description = "Official UK government scholarship program for future global leaders.",
                Source = "Chevening",
                PostedDate = DateTime.Now,
                IsActive = true
            },
            new()
            {
                Title = "Fulbright Foreign Student Program",
                Slug = "fulbright-foreign-student-program-fallback",
                Provider = "Fulbright",
                Country = "United States",
                Level = "Masters/PhD",
                Deadline = DateTime.Now.AddDays(90),
                FundingType = "Fully Funded",
                ApplyLink = "https://foreign.fulbrightonline.org/",
                Description = "Official Fulbright portal for international graduate study opportunities.",
                Source = "Fulbright",
                PostedDate = DateTime.Now,
                IsActive = true
            }
        };

        foreach (var item in fallbackScholarships)
        {
            if (await _db.Scholarships.AnyAsync(s => s.Slug == item.Slug)) continue;
            _db.Scholarships.Add(item);
        }

        await _db.SaveChangesAsync();
    }

    public async Task EnsureJobCategoryFallbacks()
    {
        var today = DateTime.Today;
        var hasGovt = await _db.Jobs.AnyAsync(j => j.IsActive && j.LastDate.Date >= today && j.Category == "govt-pk");
        var hasDubai = await _db.Jobs.AnyAsync(j => j.IsActive && j.LastDate.Date >= today && j.Category == "international");

        if (hasGovt && hasDubai) return;

        var fallbackJobs = new List<Job>();

        if (!hasGovt)
        {
            fallbackJobs.AddRange([
                new Job
                {
                    Title = "FPSC Assistant Director (Fallback)",
                    Slug = "fpsc-assistant-director-fallback",
                    Category = "govt-pk",
                    Country = "Pakistan",
                    Department = "FPSC",
                    LastDate = DateTime.Now.AddDays(25),
                    Salary = "BPS-17",
                    VisaSponsored = false,
                    ApplyLink = "https://www.fpsc.gov.pk/",
                    Description = "Fallback government listing to keep Govt Jobs category active when external source is unavailable.",
                    Source = "Fallback-Govt",
                    PostedDate = DateTime.Now,
                    IsActive = true
                },
                new Job
                {
                    Title = "Punjab Public Service Commission Lecturer (Fallback)",
                    Slug = "ppsc-lecturer-fallback",
                    Category = "govt-pk",
                    Country = "Pakistan",
                    Department = "PPSC",
                    LastDate = DateTime.Now.AddDays(18),
                    Salary = "BPS-17",
                    VisaSponsored = false,
                    ApplyLink = "https://www.ppsc.gop.pk/",
                    Description = "Fallback government listing to avoid empty state in Govt Jobs section.",
                    Source = "Fallback-Govt",
                    PostedDate = DateTime.Now,
                    IsActive = true
                }
            ]);
        }

        if (!hasDubai)
        {
            fallbackJobs.AddRange([
                new Job
                {
                    Title = "Dubai Sales Executive (Fallback)",
                    Slug = "dubai-sales-executive-fallback",
                    Category = "international",
                    Country = "UAE",
                    Department = "Dubai Private Company",
                    LastDate = DateTime.Now.AddDays(30),
                    Salary = "AED 4000-6000",
                    VisaSponsored = true,
                    ApplyLink = "https://www.naukrigulf.com/",
                    Description = "Fallback Dubai listing to keep International jobs section available.",
                    Source = "Fallback-Dubai",
                    PostedDate = DateTime.Now,
                    IsActive = true
                },
                new Job
                {
                    Title = "UAE Store Supervisor (Fallback)",
                    Slug = "uae-store-supervisor-fallback",
                    Category = "international",
                    Country = "UAE",
                    Department = "Gulf Retail Group",
                    LastDate = DateTime.Now.AddDays(22),
                    Salary = "AED 3500-5000",
                    VisaSponsored = true,
                    ApplyLink = "https://www.naukrigulf.com/",
                    Description = "Fallback Dubai/UAE listing to avoid empty International jobs category.",
                    Source = "Fallback-Dubai",
                    PostedDate = DateTime.Now,
                    IsActive = true
                }
            ]);
        }

        foreach (var job in fallbackJobs)
        {
            if (await _db.Jobs.AnyAsync(j => j.Slug == job.Slug)) continue;
            _db.Jobs.Add(job);
        }

        if (fallbackJobs.Count > 0)
            await _db.SaveChangesAsync();
    }

    private sealed class RemotiveResponse
    {
        public List<RemotiveJob> Jobs { get; set; } = [];
    }

    private sealed class RemotiveJob
    {
        public string Title { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CandidateRequiredLocation { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    private sealed class ArbeitnowResponse
    {
        public List<ArbeitnowJob> Data { get; set; } = [];
    }

    private sealed class ArbeitnowJob
    {
        public string Title { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    private sealed class RemoteOkJob
    {
        public string Position { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}