namespace RozgarHub.Api.Services;

public interface IScraperService
{
    Task RefreshIfNeeded(bool force = false);
    bool TryStartBackgroundRefresh(bool force = false);
    SyncStatus GetSyncStatus();
    Task ScrapeFPSC();
    Task ScrapePPSC();
    Task ScrapeSPSC();
    Task ScrapeKPPSC();
    Task ScrapeNTS();
    Task ScrapeNaukriGulf();
    Task ScrapeHECScholarships();
    Task ScrapeRemotiveJobs();
    Task ScrapeArbeitnowJobs();
    Task ScrapeRemoteOkJobs();
    Task EnsureJobCategoryFallbacks();
    Task EnsureScholarshipFallbacks();
    Task SyncAllSources();
}
