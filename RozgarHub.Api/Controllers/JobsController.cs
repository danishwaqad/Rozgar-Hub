using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RozgarHub.Api.Data;
using RozgarHub.Api.Models;
using RozgarHub.Api.Services;

namespace RozgarHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IScraperService _scraperService;
    public JobsController(AppDbContext db, IScraperService scraperService)
    {
        _db = db;
        _scraperService = scraperService;
    }

    // GET: api/jobs
    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] string? category,
        [FromQuery] string? country,
        [FromQuery] string? search,
        [FromQuery] int page = 1)
    {
        _scraperService.TryStartBackgroundRefresh();

        var query = _db.Jobs
            .AsNoTracking()
            .Where(j => j.IsActive && j.LastDate.Date >= DateTime.Today);
        
        if (!string.IsNullOrEmpty(category)) 
            query = query.Where(j => j.Category == category);
        if (!string.IsNullOrEmpty(country)) 
            query = query.Where(j => j.Country == country);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(j =>
                j.Title.ToLower().Contains(term) ||
                j.Department.ToLower().Contains(term) ||
                j.Description.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var jobs = await query
           .OrderByDescending(j => j.PostedDate)
           .Skip((page - 1) * 20)
           .Take(20)
           .ToListAsync();

        return Ok(new { jobs, total, page, pageSize = 20 });
    }

    // GET: api/jobs/driver-jobs-dubai-2026 - Single job by slug
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Slug == slug && j.IsActive);
        return job == null? NotFound(new { message = "Job not found" }) : Ok(job);
    }

    // POST: api/jobs/admin
    [HttpPost("admin")]
    public async Task<IActionResult> CreateJob([FromBody] Job job)
    {
        if (string.IsNullOrEmpty(job.Slug))
            job.Slug = job.Title.ToLower().Replace(" ", "-").Replace("/", "-");

        // Check duplicate slug
        if (await _db.Jobs.AnyAsync(j => j.Slug == job.Slug))
            return BadRequest(new { message = "Job with this slug already exists" });

        job.PostedDate = DateTime.Now;
        job.IsActive = true;
        
        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetBySlug), new { slug = job.Slug }, job);
    }

    // DELETE: api/jobs/admin/5
    [HttpDelete("admin/{id}")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var job = await _db.Jobs.FindAsync(id);
        if (job == null) return NotFound();
        
        job.IsActive = false; // Soft delete
        await _db.SaveChangesAsync();
        return Ok(new { message = "Job deleted" });
    }
}