using Microsoft.AspNetCore.Identity;
using ClubManagement.Services.Interfaces;
using Member = ClubManagement.Domain.Models.Member;
using ClubManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    // Implementation of IRoleService for centralized role management.
    public class RoleService : IRoleService
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User> _userManager;

        public RoleService(RoleManager<IdentityRole> roleManager, UserManager<User> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        // Creates a new identity role if it doesn't already exist.
        public async Task<IdentityResult> CreateRoleAsync(string roleName)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
            {
                return IdentityResult.Failed(new IdentityError { Description = $"Role '{roleName}' already exists." });
            }

            return await _roleManager.CreateAsync(new IdentityRole(roleName));
        }

        // Retrieves all roles from the database.
        public async Task<List<IdentityRole>> GetAllRolesAsync()
        {
            return await _roleManager.Roles.ToListAsync();
        }

        // Deletes an identity role by name.
        public async Task<IdentityResult> DeleteRoleAsync(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Role not found." });
            }

            return await _roleManager.DeleteAsync(role);
        }

        // Assigns a role to a user by their username.
        public async Task<IdentityResult> AssignRoleAsync(string username, string roleName)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found." });
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                return IdentityResult.Failed(new IdentityError { Description = "Role does not exist." });
            }

            return await _userManager.AddToRoleAsync(user, roleName);
        }

        // Removes a role from a user by their username.
        public async Task<IdentityResult> RemoveRoleAsync(string username, string roleName)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found." });
            }

            return await _userManager.RemoveFromRoleAsync(user, roleName);
        }
    }
}
