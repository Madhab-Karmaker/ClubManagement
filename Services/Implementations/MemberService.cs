using ClubManagement.Services.Interfaces;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ClubManagement.Infrastructure.Data;

namespace ClubManagement.Services.Implementations
{
    // Implementation of IMemberService for managing member profiles in the database.
    public class MemberService: IMemberService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        // Initializes a new instance of the MemberService.
        public MemberService(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // Retrieves all member profiles with their associated users.
        public async Task<IEnumerable<Member>> GetAllMembersAsync()
        {
            return await _context.Members.Include(m => m.User).ToListAsync();
        }

        // Fetches a member profile by user ID.
        public async Task<Member?> GetMemberByUserIdAsync(string userId)
        {
            return await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
        }

        // Creates an Identity user, assigns roles, then creates the linked member profile.
        public async Task<Member> CreateMemberWithAccountAsync(CreateMemberWithAccountDto dto)
        {
            var user = new User { UserName = dto.Username, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            foreach (var role in dto.Roles)
            {
                if (await _roleManager.RoleExistsAsync(role))
                    await _userManager.AddToRoleAsync(user, role);
            }

            var member = new Member
            {
                UserId      = user.Id,
                FirstName   = dto.FirstName,
                LastName    = dto.LastName,
                Email       = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                JoinDate    = dto.JoinDate,
                ExpiryDate  = dto.ExpiryDate
            };
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }
        // Records a new member profile in the database.
        public async Task<Member> CreateMemberAsync(string userId, CreateMemberDto dto)
        {
            var member = new Member
            {
                UserId = userId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                JoinDate = dto.JoinDate,
                ExpiryDate = dto.ExpiryDate
            };
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        // Modifies an existing member profile.
        public async Task<Member?> UpdateMemberAsync(string userId, UpdateMemberDto dto)
        {
            var member = await GetMemberByUserIdAsync(userId);
            if (member == null)
            {
                return null;
            }
            
            member.FirstName = dto.FirstName ?? member.FirstName;
            member.LastName = dto.LastName ?? member.LastName;
            member.Email = dto.Email ?? member.Email;
            member.PhoneNumber = dto.PhoneNumber ?? member.PhoneNumber;
            member.ExpiryDate = dto.ExpiryDate ?? member.ExpiryDate;
            member.JoinDate = member.JoinDate; // JoinDate should not be updated
            await _context.SaveChangesAsync();
            return member;
        }
    }
}
