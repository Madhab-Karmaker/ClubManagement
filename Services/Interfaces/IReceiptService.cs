using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IReceiptService
    {
        Task<DonationReceiptDto> GenerateReceiptAsync(int donationId, string? generatedByUserId = null);
        Task<DonationReceiptDto?> GetReceiptByDonationIdAsync(int donationId);
        Task<DonationReceiptDto?> GetReceiptByNumberAsync(string receiptNumber);
        Task<List<DonationReceiptDto>> GetReceiptsByMemberIdAsync(int memberId);
    }
}
