using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserController(AppDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserDto dto)
        {
            if (dto == null)
            {
                return BadRequest("User data is required.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check for duplicate username or email
                if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                {
                    return BadRequest("Username already exists.");
                }

                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    return BadRequest("Email already exists.");
                }

                var user = new User
                {
                    Username = dto.Username,
                    Email = dto.Email
                };
                user.Password = _passwordHasher.HashPassword(user, dto.Password);

                // Fetch and assign roles if provided
                if (dto.RoleIds != null && dto.RoleIds.Any())
                {
                    var roles = await _context.Roles
                        .Where(r => dto.RoleIds.Contains(r.RoleId))
                        .ToListAsync();

                    if (roles.Count != dto.RoleIds.Count)
                    {
                        return BadRequest("One or more role IDs are invalid.");
                    }

                    user.Roles = roles;
                }

                // Create Member and link to User
                var member = new Member
                {
                    FirstName = dto.FirstName ?? "",
                    LastName = dto.LastName ?? "",
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber ?? "",
                    JoinDate = dto.JoinDate ?? DateTime.UtcNow,
                    ExpiryDate = dto.ExpiryDate ?? DateTime.UtcNow
                };

                user.Member = member;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Return response without password
                var response = new UserResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Roles = user.Roles.Select(r => r.Name).ToList()
                };

                return Ok(response);
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                var detail = ex.GetBaseException().Message;
                return StatusCode(500, $"Database error: {detail}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var detail = ex.GetBaseException().Message;
                return StatusCode(500, $"An error occurred: {detail}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users.Include(u => u.Roles).ToListAsync();

                // Return response without passwords
                var response = users.Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Roles = u.Roles.Select(r => r.Name).ToList()
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
