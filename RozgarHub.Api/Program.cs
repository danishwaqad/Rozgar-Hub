using Microsoft.EntityFrameworkCore;
using RozgarHub.Api.Data;
using RozgarHub.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration["DATABASE_PUBLIC_URL"]
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? throw new InvalidOperationException("Database connection string is not configured.");

connectionString = NormalizePostgresConnectionString(connectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Scraper + HttpClient register karo
builder.Services.AddHttpClient();
builder.Services.AddScoped<IScraperService, ScraperService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(opt => {
    opt.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

app.Run();

static string NormalizePostgresConnectionString(string raw)
{
    // Accept Railway-style postgres URI and convert to Npgsql key/value format.
    if (raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(raw);
        var userInfo = Uri.UnescapeDataString(uri.UserInfo);
        var userParts = userInfo.Split(':', 2);

        if (userParts.Length != 2)
        {
            throw new InvalidOperationException("Invalid PostgreSQL URL: missing username/password.");
        }

        var database = uri.AbsolutePath.TrimStart('/');
        var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
        var sslMode = query.TryGetValue("sslmode", out var modeValue) && !string.IsNullOrWhiteSpace(modeValue)
            ? modeValue.ToString()
            : "Require";

        return $"Host={uri.Host};Port={uri.Port};Database={database};Username={userParts[0]};Password={userParts[1]};Ssl Mode={sslMode};Trust Server Certificate=true";
    }

    return raw;
}