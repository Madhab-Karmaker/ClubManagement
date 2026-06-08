using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IDonationService
    {
        Task<PagedResult<DonationResponseDto>> GetPagedDonationsAsync(DonationQueryParams query);
        Task<DonationResponseDto?> GetDonationByIdAsync(int id);
        Task<PagedResult<DonationResponseDto>> GetDonationsByMemberIdAsync(int memberId, int page, int pageSize);
        Task<DonationResponseDto> CreateDonationAsync(CreateDonationDto dto);
        Task<DonationResponseDto> UpdateDonationAsync(int id, UpdateDonationDto dto, string? changedBy = null);
        Task<bool> DeleteDonationAsync(int id);
        Task<DonationResponseDto> UpdateDonationStatusAsync(int id, int statusId, string? changedBy = null);
    }
}
