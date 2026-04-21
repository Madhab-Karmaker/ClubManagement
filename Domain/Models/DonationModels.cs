using System;
using System.Collections.Generic;

namespace ClubManagement.Domain.Models
{
    // ============================================================================
    // CORE DONATION ENTITIES
    // ============================================================================

    /// <summary>
    /// CORE: Donation Status Lookup (Completed, Pending, Cancelled)
    /// </summary>
    public class DonationStatus
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }

    /// <summary>
    /// CORE: Donation Category Lookup (General, Event, Cause, Project)
    /// </summary>
    public class DonationCategory
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }

    /// <summary>
    /// CORE: Payment Method Lookup (Cash, Online, Cheque, Bank Transfer)
    /// </summary>
    public class PaymentMethodLookup
    {
        public int PaymentMethodId { get; set; }
        public string MethodName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }

    // ============================================================================
    // SUPPORT TABLES
    // ============================================================================

    /// <summary>
    /// SUPPORT: Daily Donation Statistics (for dashboard caching)
    /// </summary>
    public class DonationStatistic
    {
        public int StatisticId { get; set; }
        public DateTime StatisticDate { get; set; }
        public decimal TotalDonations { get; set; } = 0;
        public decimal CompletedDonations { get; set; } = 0;
        public decimal PendingDonations { get; set; } = 0;
        public int TotalDonationCount { get; set; } = 0;
        public int UniqueDonors { get; set; } = 0;
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// SUPPORT: Monthly Donation Summary (for trend analysis)
    /// </summary>
    public class MonthlySummary
    {
        public int SummaryId { get; set; }
        public string YearMonth { get; set; } = null!; // Format: YYYY-MM
        public decimal TotalAmount { get; set; } = 0;
        public int DonationCount { get; set; } = 0;
        public int UniqueDonors { get; set; } = 0;
        public decimal PreviousMonthAmount { get; set; } = 0;
        public decimal PercentageChange { get; set; } = 0;
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// SUPPORT: Donation Audit Log (for change tracking)
    /// </summary>
    public class DonationAuditLog
    {
        public int AuditId { get; set; }
        public int DonationId { get; set; }
        public string ActionType { get; set; } = null!; // Created, Updated, Deleted, Verified
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Donation Donation { get; set; } = null!;
    }

    // ============================================================================
    // DATA TRANSFER OBJECTS (DTOs) FOR API
    // ============================================================================

    public class DashboardSummaryDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveDonors { get; set; }
        public decimal DonationsThisMonth { get; set; }
    }

    public class RecentDonationDto
    {
        public int DonationId { get; set; }
        public int DonorId { get; set; }
        public string DonorName { get; set; } = null!;
        public string DonorEmail { get; set; } = null!;
        public string DonorPhone { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public string Category { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
    }

    public class TopDonorDto
    {
        public int DonorId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? ProfileImage { get; set; }
        public decimal TotalDonation { get; set; }
        public DateTime LastDonation { get; set; }
        public string Status { get; set; } = null!;
        public int DonationCount { get; set; }
        public DateTime JoinDate { get; set; }
    }

    public class DonationTrendDto
    {
        public string Month { get; set; } = null!;
        public decimal Amount { get; set; }
        public decimal PercentageChange { get; set; }
    }

    public class DonationCategoryDto
    {
        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public int Percentage { get; set; }
    }

    public class DailyDonationDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class DonationDashboardDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveDonors { get; set; }
        public List<RecentDonationDto> RecentDonations { get; set; } = new();
        public List<TopDonorDto> TopDonors { get; set; } = new();
        public List<DonationTrendDto> Trends { get; set; } = new();
        public List<DonationCategoryDto> Categories { get; set; } = new();
        public List<DailyDonationDto> DailyDonations { get; set; } = new();
    }
}
