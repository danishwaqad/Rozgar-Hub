using Microsoft.EntityFrameworkCore;
using RozgarHub.Api.Models;

namespace RozgarHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Job> Jobs { get; set; }
    public DbSet<Scholarship> Scholarships { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Job>().HasIndex(j => j.Slug).IsUnique();
        modelBuilder.Entity<Job>().HasIndex(j => new { j.Category, j.IsActive, j.LastDate });
        modelBuilder.Entity<Scholarship>().HasIndex(s => s.Slug).IsUnique();
        modelBuilder.Entity<Scholarship>().HasIndex(s => new { s.Country, s.IsActive, s.Deadline });
    }
}