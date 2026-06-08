using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IReportService
    {
        Task<byte[]> GenerateDonationReportAsync(GenerateReportDto dto);
        Task<byte[]> GenerateMemberReportAsync(GenerateReportDto dto);
        Task<List<ReportDto>> GetSavedReportsAsync();
        Task<ReportDto?> GetSavedReportByIdAsync(int id);
        Task<bool> DeleteSavedReportAsync(int id);
    }
}
