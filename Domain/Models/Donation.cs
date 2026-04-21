using ClubManagement.Domain.Constants;

namespace ClubManagement.Domain.Models
{
    public class Donation
    {
        // ============================================================
        // CORE FIELDS (Existing)
        // ============================================================
        public int Id { get; set; }
        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }

        /// <summary>Transaction / cheque reference (optional).</summary>
        public string? ReferenceNumber { get; set; }

        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ============================================================
        // LEGACY FIELDS (Keep for backward compatibility - Mark Obsolete)
        // ============================================================
        [Obsolete("Use CategoryId with DonationCategory table instead")]
        public DonationType DonationType { get; set; }

        [Obsolete("Use PaymentMethodId with PaymentMethodLookup table instead")]
        public PaymentMethod PaymentMethod { get; set; }

        // ============================================================
        // NEW FIELDS FOR DASHBOARD SYSTEM
        // ============================================================

        /// <summary>
        /// Donation Status FK
        /// 1 = Completed, 2 = Pending, 3 = Cancelled
        /// </summary>
        public int StatusId { get; set; } = 1; // Default: Completed

        /// <summary>Navigation to DonationStatus (Completed/Pending/Cancelled)</summary>
        public DonationStatus Status { get; set; } = null!;

        /// <summary>
        /// Donation Category FK
        /// 1 = General, 2 = Event, 3 = Cause, 4 = Project
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>Navigation to DonationCategory</summary>
        public DonationCategory Category { get; set; } = null!;

        /// <summary>
        /// Payment Method FK
        /// 1 = Cash, 2 = Online, 3 = Cheque, 4 = BankTransfer
        /// </summary>
        public int PaymentMethodId { get; set; }

        /// <summary>Navigation to PaymentMethodLookup</summary>
        public PaymentMethodLookup PaymentMethodLookup { get; set; } = null!;

        /// <summary>Audit logs tracking all changes to this donation</summary>
        public ICollection<DonationAuditLog> AuditLogs { get; set; }
            = new List<DonationAuditLog>();
    }
}
