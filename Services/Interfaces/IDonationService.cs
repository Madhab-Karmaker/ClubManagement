using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IDonationService
    {
        /// <summary>List all donations with pagination, filtering and sorting.</summary>
        Task<PagedResult<DonationResponseDto>> GetPagedDonationsAsync(DonationQueryParams query);

        /// <summary>Get a single donation by ID.</summary>
        Task<DonationResponseDto?> GetDonationByIdAsync(int id);

        /// <summary>Get paginated donation history for a specific member.</summary>
        Task<PagedResult<DonationResponseDto>> GetDonationsByMemberIdAsync(int memberId, int page, int pageSize);

        /// <summary>Create a new donation record.</summary>
        Task<DonationResponseDto> CreateDonationAsync(CreateDonationDto dto);
    }
}
