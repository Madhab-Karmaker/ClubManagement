using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Services.Interfaces
{
    public interface IRoleService
    {
        Task<IdentityResult> CreateRoleAsync(string roleName);
        Task<List<IdentityRole>> GetAllRolesAsync();
        Task<IdentityRole?> GetRoleByIdAsync(string roleId);
        Task<IdentityRole?> GetRoleByNameAsync(string roleName);
        Task<IdentityResult> UpdateRoleAsync(string roleId, string newRoleName);
        Task<IdentityResult> DeleteRoleAsync(string roleName);
        Task<IdentityResult> AssignRoleAsync(string username, string roleName);
        Task<IdentityResult> RemoveRoleAsync(string username, string roleName);
    }
}
