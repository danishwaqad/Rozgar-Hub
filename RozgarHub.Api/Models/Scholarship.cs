namespace RozgarHub.Api.Models;

public class Scholarship
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public string FundingType { get; set; } = string.Empty;
    public string ApplyLink { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime PostedDate { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;
}
