using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IBulkOperationService
    {
        Task<BulkOperationResultDto> BulkDeleteMembersAsync(List<int> memberIds);
        Task<BulkOperationResultDto> BulkDeleteDonationsAsync(List<int> donationIds);
        Task<BulkOperationResultDto> BulkUpdateMemberStatusAsync(List<int> memberIds, bool isActive);
        Task<BulkOperationResultDto> BulkUpdateDonationStatusAsync(List<int> donationIds, int statusId);
    }
}
