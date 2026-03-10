using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;

namespace ClubManagement.Services.Interfaces
{
    public interface IMemberService
    {
        // Paginated list with optional search, role, and status filters.
        Task<PagedResult<MemberResponseDto>> GetPagedMembersAsync(
            string? search, string? role, bool? isActive, int page, int pageSize);

        // Retrieve a single member profile by their Member ID.
        Task<MemberResponseDto?> GetMemberByIdAsync(int memberId);

        // Create a user account and linked member profile in one operation.
        Task<MemberResponseDto> CreateMemberWithAccountAsync(CreateMemberWithAccountDto dto);

        // Update a member profile (and optionally roles) by Member ID.
        Task<MemberResponseDto?> UpdateMemberByIdAsync(int memberId, UpdateMemberDto dto);

        // Hard-delete a member (soft-deletes associated user account).
        Task<bool> DeleteMemberAsync(int memberId);

        // ── Legacy methods used by ProfileController ──────────────────────
        Task<Member?> GetMemberByUserIdAsync(string userId);
        Task<Member> CreateMemberAsync(string userId, CreateMemberDto dto);
        Task<Member?> UpdateMemberAsync(string userId, UpdateMemberDto dto);
    }
}
