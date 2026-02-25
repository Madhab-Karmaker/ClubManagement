using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;

namespace ClubManagement.Services.Interfaces
{
    public interface IUserService
    {
        Task<User> CreateUserAsync(RegisterDto dto);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<bool> ValidateUserPasswordAsync(string username, string password);
        Task<List<User>> GetAllUsersAsync();
    }
}