using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Services.Interfaces
{
    // Defines operations for user and role management.
    public interface IUserService
    {
        // Creates a new user in the system.
        Task<User> CreateUserAsync(RegisterDto dto);

        // Retrieves a user by their username.
        Task<User?> GetUserByUsernameAsync(string username);

        // Validates a user's password.
        Task<bool> ValidateUserPasswordAsync(string username, string password);

        // Retrieves all users in the system.
        Task<List<User>> GetAllUsersAsync(bool includeDeleted = false);

        // Soft-deletes a user from the system.
        Task<bool> DeleteUserAsync(string userId);

        // Logs out the current user.
        Task LogoutAsync();

        // Assigns a role to a user.
        Task<IdentityResult> AssignRoleAsync(User user, string roleName);

        // Removes a role from a user.
        Task<IdentityResult> RemoveRoleAsync(User user, string roleName);

        // Retrieves the roles assigned to a user.
        Task<IList<string>> GetUserRolesAsync(User user);
    }
}