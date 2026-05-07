namespace RozgarHub.Api.Models;

public class Job
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime LastDate { get; set; }
    public string Salary { get; set; } = string.Empty;
    public bool VisaSponsored { get; set; }
    public string ApplyLink { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;
}