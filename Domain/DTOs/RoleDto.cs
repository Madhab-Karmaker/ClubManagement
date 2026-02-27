namespace ClubManagement.Domain.DTOs
{
    // Data transfer object for role-related requests.
    public class RoleDto
    {
        // The name of the role.
        public string RoleName { get; set; } = null!;
    }

    // Data transfer object for assigning or removing roles from users.
    public class UserRoleDto
    {
        // The username of the targeted user.
        public string Username { get; set; } = null!;

        // The name of the role to be assigned or removed.
        public string RoleName { get; set; } = null!;
    }
}
