using ClubManagement.Domain.Constants;

namespace ClubManagement.Domain.Models
{
    public class Donation
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        public decimal Amount { get; set; }
        public DonationType DonationType { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        /// <summary>Transaction / cheque reference (optional).</summary>
        public string? ReferenceNumber { get; set; }

        public DateTime DonationDate { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
