namespace ClubManagement.Domain.DTOs
{
    public class DashboardSummaryDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int ExpiringMembers { get; set; }
        public int ActiveDonors { get; set; }
        public decimal DonationsThisMonth { get; set; }
        public int DonationsThisMonthCount { get; set; }
        public decimal AverageDonation { get; set; }
        public int PendingDonationsCount { get; set; }
        public int UpcomingEventsCount { get; set; }
        public int UnreadNotificationsCount { get; set; }
        public List<RecentDonationDto> RecentDonations { get; set; } = new();
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
    }

    public class RecentDonationDto
    {
        public int DonationId { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = null!;
        public string? MemberEmail { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public string Category { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string Status { get; set; } = null!;
    }

    public class MonthlyTrendDto
    {
        public string Month { get; set; } = null!;
        public decimal Amount { get; set; }
        public int Count { get; set; }
        public decimal PercentageChange { get; set; }
    }

    public class DonorProfileDto
    {
        public int MemberId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Address { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime JoinDate { get; set; }
        public DateTime? LastDonationDate { get; set; }
        public decimal TotalDonations { get; set; }
        public int DonationCount { get; set; }
        public decimal AverageDonation { get; set; }
        public string? LargestDonationCategory { get; set; }
        public string Status { get; set; } = null!;
        public bool IsActive { get; set; }
    }

    public class TopDonorDto
    {
        public int MemberId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public decimal TotalDonation { get; set; }
        public DateTime LastDonation { get; set; }
        public int DonationCount { get; set; }
        public string? LargestCategory { get; set; }
    }

    public class DonationAnalyticsDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalDonors { get; set; }
        public int TotalDonationsCount { get; set; }
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
        public List<CategoryBreakdownDto> CategoryBreakdown { get; set; } = new();
        public List<TopDonorDto> TopDonors { get; set; } = new();
        public List<DailyDonationDto> DailyDonations { get; set; } = new();
    }

    public class CategoryBreakdownDto
    {
        public string CategoryName { get; set; } = null!;
        public decimal Amount { get; set; }
        public int Count { get; set; }
        public int Percentage { get; set; }
    }

    public class DailyDonationDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    public class DonationReceiptDto
    {
        public int ReceiptId { get; set; }
        public string ReceiptNumber { get; set; } = null!;
        public int DonationId { get; set; }
        public string MemberName { get; set; } = null!;
        public string MemberEmail { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string? ReferenceNumber { get; set; }
        public DateTime DonationDate { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string? Note { get; set; }
    }

    public class EventDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public decimal? Budget { get; set; }
        public int? MaxAttendees { get; set; }
        public int AttendeeCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateEventDto
    {
        public string EventName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public decimal? Budget { get; set; }
        public int? MaxAttendees { get; set; }
    }

    public class UpdateEventDto
    {
        public string? EventName { get; set; }
        public string? Description { get; set; }
        public DateTime? EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public decimal? Budget { get; set; }
        public int? MaxAttendees { get; set; }
        public bool? IsActive { get; set; }
    }

    public class MembershipFeeDto
    {
        public int MembershipFeeId { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool IsPaid { get; set; }
        public int? DonationId { get; set; }
        public string? Note { get; set; }
    }

    public class CreateMembershipFeeDto
    {
        public int MemberId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string? Note { get; set; }
    }

    public class MembershipRenewalDto
    {
        public int MembershipRenewalId { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = null!;
        public DateTime PreviousExpiryDate { get; set; }
        public DateTime NewExpiryDate { get; set; }
        public decimal? FeePaid { get; set; }
        public string? Note { get; set; }
        public DateTime RenewedAt { get; set; }
    }

    public class RenewMembershipDto
    {
        public int MemberId { get; set; }
        public int RenewMonths { get; set; } = 12;
        public decimal? FeePaid { get; set; }
        public string? Note { get; set; }
    }

    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string? Message { get; set; }
        public string Type { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class CreateNotificationDto
    {
        public int? MemberId { get; set; }
        public string? UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Message { get; set; }
        public string Type { get; set; } = "Info";
    }

    public class BulkOperationDto
    {
        public List<int> Ids { get; set; } = new();
        public string Action { get; set; } = null!;
        public Dictionary<string, object?>? Parameters { get; set; }
    }

    public class BulkOperationResultDto
    {
        public int TotalRequested { get; set; }
        public int Succeeded { get; set; }
        public int Failed { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class SearchResultDto
    {
        public List<MemberSearchHitDto> Members { get; set; } = new();
        public List<DonationSearchHitDto> Donations { get; set; } = new();
        public List<EventSearchHitDto> Events { get; set; } = new();
        public int TotalResults => Members.Count + Donations.Count + Events.Count;
    }

    public class MemberSearchHitDto
    {
        public int MemberId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
    }

    public class DonationSearchHitDto
    {
        public int DonationId { get; set; }
        public string MemberName { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public string? ReferenceNumber { get; set; }
    }

    public class EventSearchHitDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public string? Location { get; set; }
    }

    public class ReportDto
    {
        public int SavedReportId { get; set; }
        public string ReportName { get; set; } = null!;
        public string ReportType { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class GenerateReportDto
    {
        public string ReportName { get; set; } = null!;
        public string ReportType { get; set; } = null!;
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? MemberId { get; set; }
        public int? CategoryId { get; set; }
    }

    public class AuditLogDto
    {
        public int AuditId { get; set; }
        public int DonationId { get; set; }
        public string ActionType { get; set; } = null!;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    public class PaymentLedgerEntryDto
    {
        public int DonationId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Category { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? ReferenceNumber { get; set; }
        public string? Note { get; set; }
    }

    public class ExpiringMemberDto
    {
        public int MemberId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public DateTime ExpiryDate { get; set; }
        public int DaysUntilExpiry { get; set; }
    }
}
