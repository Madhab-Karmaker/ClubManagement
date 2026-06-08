namespace ClubManagement.Domain.Models
{
    public class SavedReport
    {
        public int SavedReportId { get; set; }
        public string ReportName { get; set; } = null!;
        public string ReportType { get; set; } = null!;
        public string? Parameters { get; set; }
        public string? GeneratedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? FilePath { get; set; }

        public User? GeneratedBy { get; set; }
    }
}
