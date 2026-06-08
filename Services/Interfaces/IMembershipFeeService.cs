using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IMembershipFeeService
    {
        Task<List<MembershipFeeDto>> GetByMemberIdAsync(int memberId);
        Task<List<MembershipFeeDto>> GetPendingFeesAsync();
        Task<MembershipFeeDto> CreateFeeAsync(CreateMembershipFeeDto dto);
        Task<bool> MarkAsPaidAsync(int feeId, int donationId);
        Task<bool> DeleteFeeAsync(int feeId);
        Task<MembershipRenewalDto> RenewMembershipAsync(RenewMembershipDto dto, string? renewedByUserId = null);
        Task<List<ExpiringMemberDto>> GetExpiringMembersAsync(int withinDays = 30);
        Task<List<MembershipRenewalDto>> GetRenewalHistoryAsync(int memberId);
    }
}
