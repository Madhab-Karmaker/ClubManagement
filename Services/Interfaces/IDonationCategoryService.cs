using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IDonationCategoryService
    {
        Task<List<DonationCategoryDto>> GetAllAsync();
        Task<DonationCategoryDto> GetByIdAsync(int id);
        Task<DonationCategoryDto> CreateAsync(CreateDonationCategoryDto dto);
        Task<DonationCategoryDto> UpdateAsync(int id, UpdateDonationCategoryDto dto);
        Task<bool> DeleteAsync(int id);
    }
}