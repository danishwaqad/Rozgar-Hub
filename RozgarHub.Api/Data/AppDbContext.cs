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

    public override int SaveChanges()
    {
        NormalizeDateTimesToUtc();
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        NormalizeDateTimesToUtc();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        NormalizeDateTimesToUtc();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        NormalizeDateTimesToUtc();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void NormalizeDateTimesToUtc()
    {
        foreach (var entry in ChangeTracker.Entries().Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            foreach (var property in entry.Properties)
            {
                if (property.Metadata.ClrType == typeof(DateTime))
                {
                    if (property.CurrentValue is DateTime dateTime)
                    {
                        property.CurrentValue = dateTime.Kind switch
                        {
                            DateTimeKind.Utc => dateTime,
                            DateTimeKind.Local => dateTime.ToUniversalTime(),
                            _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
                        };
                    }
                }
                else if (property.Metadata.ClrType == typeof(DateTime?))
                {
                    if (property.CurrentValue is DateTime nullableDateTime)
                    {
                        property.CurrentValue = nullableDateTime.Kind switch
                        {
                            DateTimeKind.Utc => nullableDateTime,
                            DateTimeKind.Local => nullableDateTime.ToUniversalTime(),
                            _ => DateTime.SpecifyKind(nullableDateTime, DateTimeKind.Utc)
                        };
                    }
                }
            }
        }
    }
}