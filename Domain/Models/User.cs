namespace ClubManagement.Domain.Models
{
      public class User
     {
            public int UserId { get; set; }
            public string Username { get; set; } = null!;
            public string Password { get; set; } = null!; // Store hashed passwords!
            public string Email { get; set; } = null!;

            // Role relationship
            public ICollection<Role> Roles { get; set; } = new List<Role>();
            public Member? Member { get; set; }
        
        }
}
