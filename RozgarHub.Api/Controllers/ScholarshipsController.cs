using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RozgarHub.Api.Data;
using RozgarHub.Api.Models;
using RozgarHub.Api.Services;

namespace RozgarHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScholarshipsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IScraperService _scraperService;
    public ScholarshipsController(AppDbContext db, IScraperService scraperService)
    {
        _db = db;
        _scraperService = scraperService;
    }

    // GET: api/scholarships
    [HttpGet]
    public async Task<IActionResult> GetScholarships(
        [FromQuery] string? country,
        [FromQuery] string? level,
        [FromQuery] string? search,
        [FromQuery] int page = 1)
    {
        _scraperService.TryStartBackgroundRefresh();
        var todayUtcStart = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        var query = _db.Scholarships
            .AsNoTracking()
            .Where(s => s.IsActive && s.Deadline >= todayUtcStart);

        if (!string.IsNullOrWhiteSpace(country))
            query = query.Where(s => s.Country == country);
        if (!string.IsNullOrWhiteSpace(level))
            query = query.Where(s => s.Level == level);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.Title.ToLower().Contains(term) ||
                s.Provider.ToLower().Contains(term) ||
                s.Description.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var scholarships = await query
            .OrderByDescending(s => s.PostedDate)
            .Skip((page - 1) * 20)
            .Take(20)
            .ToListAsync();

        return Ok(new { scholarships, total, page, pageSize = 20 });
    }

    // GET: api/scholarships/{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var scholarship = await _db.Scholarships
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Slug == slug && s.IsActive);

        return scholarship == null ? NotFound(new { message = "Scholarship not found" }) : Ok(scholarship);
    }

    // POST: api/scholarships/admin
    [HttpPost("admin")]
    public async Task<IActionResult> CreateScholarship([FromBody] Scholarship scholarship)
    {
        if (string.IsNullOrWhiteSpace(scholarship.Slug))
            scholarship.Slug = scholarship.Title.ToLower().Replace(" ", "-").Replace("/", "-");

        if (await _db.Scholarships.AnyAsync(s => s.Slug == scholarship.Slug))
            return BadRequest(new { message = "Scholarship with this slug already exists" });

        scholarship.PostedDate = DateTime.UtcNow;
        scholarship.IsActive = true;

        _db.Scholarships.Add(scholarship);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBySlug), new { slug = scholarship.Slug }, scholarship);
    }

    // DELETE: api/scholarships/admin/{id}
    [HttpDelete("admin/{id}")]
    public async Task<IActionResult> DeleteScholarship(int id)
    {
        var scholarship = await _db.Scholarships.FindAsync(id);
        if (scholarship == null) return NotFound();

        scholarship.IsActive = false;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Scholarship deleted" });
    }
}
