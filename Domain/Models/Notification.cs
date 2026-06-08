namespace ClubManagement.Domain.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public int? MemberId { get; set; }
        public string? UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Message { get; set; }
        public string Type { get; set; } = "Info";
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SentAt { get; set; }

        public Member? Member { get; set; }
        public User? User { get; set; }
    }
}
