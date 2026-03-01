using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Services.Interfaces
{
    public interface IRoleService
    {
        Task<IdentityResult> CreateRoleAsync(string roleName);
        Task<List<IdentityRole>> GetAllRolesAsync();
        Task<IdentityResult> DeleteRoleAsync(string roleName);
        Task<IdentityResult> AssignRoleAsync(string username, string roleName);
        Task<IdentityResult> RemoveRoleAsync(string username, string roleName);
    }
}
