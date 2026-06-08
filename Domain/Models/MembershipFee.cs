namespace ClubManagement.Domain.Models
{
    public class MembershipFee
    {
        public int MembershipFeeId { get; set; }
        public int MemberId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool IsPaid { get; set; } = false;
        public int? DonationId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Member Member { get; set; } = null!;
        public Donation? Donation { get; set; }
    }

    public class MembershipRenewal
    {
        public int MembershipRenewalId { get; set; }
        public int MemberId { get; set; }
        public DateTime PreviousExpiryDate { get; set; }
        public DateTime NewExpiryDate { get; set; }
        public decimal? FeePaid { get; set; }
        public string? Note { get; set; }
        public DateTime RenewedAt { get; set; } = DateTime.UtcNow;
        public string? RenewedByUserId { get; set; }

        public Member Member { get; set; } = null!;
        public User? RenewedBy { get; set; }
    }
}
