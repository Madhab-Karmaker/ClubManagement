namespace ClubManagement.Domain.DTOs
{
    // Data transfer object for creating a new member profile.
    public class CreateMemberDto
    {
        // Member's first name.
        public string FirstName { get; set; } = null!;

        // Member's last name.
        public string LastName { get; set; } = null!;

        // Member's email address.
        public string Email { get; set; } = null!;

        // Member's phone number.
        public string PhoneNumber { get; set; } = null!;

        // The date the member joined.
        public DateTime JoinDate { get; set; }

        // The date the membership expires.
        public DateTime ExpiryDate { get; set; }
    }

    // Data transfer object for updating an existing member profile.
    public class UpdateMemberDto
    {
        // Updated first name (optional).
        public string? FirstName { get; set; }

        // Updated last name (optional).
        public string? LastName { get; set; }

        // Updated email address (optional).
        public string? Email { get; set; }

        // Updated phone number (optional).
        public string? PhoneNumber { get; set; }

        // Updated expiry date (optional).
        public DateTime? ExpiryDate { get; set; }
    }
}