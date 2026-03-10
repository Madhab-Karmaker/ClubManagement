using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;

namespace ClubManagement.Services.Interfaces
{
    // Defines operations for managing club member profiles.
    public interface IMemberService
    {
        // Retrieves all member profiles.
        Task<IEnumerable<Member>> GetAllMembersAsync();

        // Retrieves a member profile by their associated user ID.
        Task<Member?> GetMemberByUserIdAsync(string userId);

        // Creates an Identity user, assigns roles, and creates the linked member profile.
        Task<Member> CreateMemberWithAccountAsync(CreateMemberWithAccountDto dto);

        // Creates a new member profile for a user.
        Task<Member> CreateMemberAsync(string userId, CreateMemberDto dto);

        // Updates an existing member profile.
        Task<Member?> UpdateMemberAsync(string userId, UpdateMemberDto dto);
    }
}
