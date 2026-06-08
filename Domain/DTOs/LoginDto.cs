
namespace ClubManagement.Domain.DTOs
{
    // Data transfer object for user login requests.
    public class LoginDto
    {
        public string Username { get; set; } = null!;

        public string Password { get; set; } = null!;
    }
}
