using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Domain.Models
{
    public class User: IdentityUser
    {
            // Role relationship is now handled by IdentityUser
            public Member? Member { get; set; }
        
        }
}
