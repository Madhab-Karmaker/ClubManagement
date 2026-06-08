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

}
