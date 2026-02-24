using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(AppDbContext context,
                       IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<User> CreateUserAsync(CreateUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            throw new Exception("Username already exists");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email
        };

        user.Password =
            _passwordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    // ✅ Added this method (missing before)
    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    // ✅ Renamed to match interface
    public async Task<bool> ValidateUserPasswordAsync(string username, string password)
    {
        var user = await GetUserByUsernameAsync(username);

        if (user == null) return false;

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.Password,
            password
        );

        return result == PasswordVerificationResult.Success;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Roles)
            .ToListAsync();
    }
}