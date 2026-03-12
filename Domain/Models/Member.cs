namespace ClubManagement.Domain.Models
{
    public class Member
    {
        public int MemberId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Address { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime JoinDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public string? UserId { get; set; }
        public User? User { get; set; }

        // Navigation
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }
}

