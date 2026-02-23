        namespace ClubManagement.Domain.DTOs
        {
            public class UserResponseDto
            {
                public int UserId { get; set; }
                public string Username { get; set; } = null!;
                public string Email { get; set; } = null!;
                public List<string> Roles { get; set; } = new List<string>();
            }
        }
