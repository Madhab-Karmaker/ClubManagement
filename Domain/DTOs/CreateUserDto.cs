namespace ClubManagement.Domain.DTOs
{
    public class CreateUserDto
    {
        // User info
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!; // hashed before saving
        public string Email { get; set; } = null!;

        // Optional Member info (if creating Member alongside User)
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? JoinDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

    }
}