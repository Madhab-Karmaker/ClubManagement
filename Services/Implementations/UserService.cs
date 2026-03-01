using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services
{
    // Implementation of IUserService for managing users and roles using ASP.NET Core Identity.
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        // Initializes a new instance of the UserService.
        public UserService(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        // Creates a user and assigns the default Member role.
        public async Task<User> CreateUserAsync(RegisterDto dto)
        {
            var existingUser = await _userManager.FindByNameAsync(dto.Username);
            if (existingUser != null)
                throw new Exception("Username already exists");

            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Assign default role
            await _userManager.AddToRoleAsync(user, RoleConstants.Member);

            return user;
        }

        // Finds a user by their username.
        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }

        // Validates user credentials.
        public async Task<bool> ValidateUserPasswordAsync(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return false;

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
            return result.Succeeded;
        }

        // Retrieves a list of all users.
        public async Task<List<User>> GetAllUsersAsync(bool includeDeleted = false)
        {
            var query = _userManager.Users;
            if (!includeDeleted)
            {
                query = query.Where(u => !u.IsDeleted);
            }
            return await query.ToListAsync();
        }

        // Marks a user as deleted (soft delete).
        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.IsDeleted = true;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        // Signs out the current user.
        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }
    }
}