namespace ClubManagement.Domain.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public decimal? Budget { get; set; }
        public int? MaxAttendees { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedByUserId { get; set; }

        public User? CreatedBy { get; set; }
        public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
        public ICollection<EventDonation> EventDonations { get; set; } = new List<EventDonation>();
    }

    public class EventAttendee
    {
        public int EventAttendeeId { get; set; }
        public int EventId { get; set; }
        public int MemberId { get; set; }
        public bool Attended { get; set; } = false;
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public Event Event { get; set; } = null!;
        public Member Member { get; set; } = null!;
    }

    public class EventDonation
    {
        public int EventDonationId { get; set; }
        public int EventId { get; set; }
        public int DonationId { get; set; }

        public Event Event { get; set; } = null!;
        public Donation Donation { get; set; } = null!;
    }
}
