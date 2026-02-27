    namespace ClubManagement.Domain.Models
    {
        // Represents a club member profile linked to an identity user.
        public class Member
        {
            // Unique identifier for the member.
            public int MemberId { get; set; }

            // Member's first name.
            public string FirstName { get; set; } = null!;

            // Member's last name.
            public string LastName { get; set; } = null!;

            // Member's email address.
            public string Email { get; set; } = null!;

            // Member's phone number.
            public string PhoneNumber { get; set; } = null!;

            // The date the member joined the club.
            public DateTime JoinDate { get; set; }

            // The date the membership expires.
            public DateTime ExpiryDate { get; set; }

            // Foreign key to the associated identity user.
            public string? UserId { get; set; }

            // Navigation property to the identity user.
            public User? User { get; set; }
        }
    }

