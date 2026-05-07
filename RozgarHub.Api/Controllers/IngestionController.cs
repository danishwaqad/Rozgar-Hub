using Microsoft.AspNetCore.Mvc;
using RozgarHub.Api.Services;

namespace RozgarHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngestionController : ControllerBase
{
    [HttpGet("status")]
    public IActionResult Status([FromServices] IScraperService scraperService)
    {
        return Ok(scraperService.GetSyncStatus());
    }

    [HttpPost("sync-all")]
    public IActionResult SyncAll([FromServices] IScraperService scraperService)
    {
        var started = scraperService.TryStartBackgroundRefresh(force: true);
        return Accepted(new
        {
            message = started ? "All source background sync started" : "Sync already running"
        });
    }

    [HttpPost("sync/{source}")]
    public async Task<IActionResult> SyncSource(string source, [FromServices] IScraperService scraperService)
    {
        var normalized = source.Trim().ToLower();
        if (normalized == "fpsc")
        {
            await scraperService.ScrapeFPSC();
            return Ok(new { message = "FPSC sync completed" });
        }

        if (normalized == "naukrigulf")
        {
            await scraperService.ScrapeNaukriGulf();
            return Ok(new { message = "NaukriGulf sync completed" });
        }

        if (normalized == "hec")
        {
            await scraperService.ScrapeHECScholarships();
            return Ok(new { message = "HEC scholarships sync completed" });
        }

        if (normalized == "remotive")
        {
            await scraperService.ScrapeRemotiveJobs();
            return Ok(new { message = "Remotive sync completed" });
        }

        if (normalized == "arbeitnow")
        {
            await scraperService.ScrapeArbeitnowJobs();
            return Ok(new { message = "Arbeitnow sync completed" });
        }

        if (normalized == "remoteok")
        {
            await scraperService.ScrapeRemoteOkJobs();
            return Ok(new { message = "RemoteOK sync completed" });
        }

        if (normalized == "scholarships-fallback")
        {
            await scraperService.EnsureScholarshipFallbacks();
            return Ok(new { message = "Scholarships fallback sync completed" });
        }

        if (normalized == "jobs-fallback")
        {
            await scraperService.EnsureJobCategoryFallbacks();
            return Ok(new { message = "Jobs category fallback sync completed" });
        }

        return BadRequest(new { message = "Unknown source. Use: fpsc, naukrigulf, hec, remotive, arbeitnow, remoteok, scholarships-fallback, jobs-fallback" });
    }
}
