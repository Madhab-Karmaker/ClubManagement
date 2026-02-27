using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Domain.Models
{
    // Represents an identity user in the system with extended club management properties.
    public class User: IdentityUser
    {
        // Navigation property to the associated member profile.
        public Member? Member { get; set; }

        // Flag indicating if the user has been soft-deleted.
        public bool IsDeleted { get; set; } = false;
    }
}
