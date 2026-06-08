namespace ClubManagement.Domain.Models
{
    public class Receipt
    {
        public int ReceiptId { get; set; }
        public int DonationId { get; set; }
        public string ReceiptNumber { get; set; } = null!;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string? GeneratedByUserId { get; set; }

        public Donation Donation { get; set; } = null!;
        public User? GeneratedBy { get; set; }
    }
}
