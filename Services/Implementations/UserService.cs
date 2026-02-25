using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public UserService(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

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

            return user;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }

        public async Task<bool> ValidateUserPasswordAsync(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return false;

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
            return result.Succeeded;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            // UserManager এর Users property IQueryable<User> return করে
            return await _userManager.Users.ToListAsync();
        }
    }
}