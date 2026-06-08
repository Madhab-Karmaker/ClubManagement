namespace ClubManagement.Domain.Models
{
    public class Donation
    {
        // ============================================================
        // CORE FIELDS
        // ============================================================
        public int Id { get; set; }
        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }

        public string? ReferenceNumber { get; set; }
        public string? ReceiptNumber { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ============================================================
        // STATUS & CATEGORY
        // ============================================================

        public int StatusId { get; set; } = 1;
        public DonationStatus Status { get; set; } = null!;

        public int CategoryId { get; set; }
        public DonationCategory Category { get; set; } = null!;

        public int PaymentMethodId { get; set; }
        public PaymentMethodLookup PaymentMethodLookup { get; set; } = null!;

        // ============================================================
        // SOFT DELETE
        // ============================================================
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // ============================================================
        // AUDIT & NAVIGATION
        // ============================================================
        public ICollection<DonationAuditLog> AuditLogs { get; set; }
            = new List<DonationAuditLog>();
    }
}
