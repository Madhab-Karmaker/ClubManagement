
namespace ClubManagement.Domain.DTOs
{
    // Data transfer object for user login requests.
    public class LoginDto
    {
        // The username of the user attempting to log in.
        public string Username { get; set; }  

        // The password of the user attempting to log in.
        public string Password { get; set; }
    }
}
