namespace ClubManagement.Domain.DTOs
{
    // Data transfer object for user registration requests.
    public class RegisterDto
    {
        // The chosen username for the new account.
        public string Username { get; set; } = null!;

        // The email address for the new account.
        public string Email { get; set; } = null!;

        // The password for the new account.
        public string Password { get; set; } = null!;
    }
}
