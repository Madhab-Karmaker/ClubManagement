using ClubManagement.Services.Interfaces;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;
using ClubManagement.Infrastructure.Data;

namespace ClubManagement.Services.Implementations
{
    // Implementation of IMemberService for managing member profiles in the database.
    public class MemberService: IMemberService
    {
        private readonly AppDbContext _context;

        // Initializes a new instance of the MemberService.
        public MemberService(AppDbContext context)
        {
            _context = context;
        }
        // Fetches a member profile by user ID.
        public async Task<Member?> GetMemberByUserIdAsync(string userId)
        {
            return await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
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
