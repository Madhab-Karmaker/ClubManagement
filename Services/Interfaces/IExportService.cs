namespace ClubManagement.Services.Interfaces
{
    public interface IExportService
    {
        Task<byte[]> ExportDonationsToCsvAsync(DateTime? fromDate = null, DateTime? toDate = null, int? categoryId = null);
        Task<byte[]> ExportMembersToCsvAsync(string? search = null, bool? isActive = null);
        Task<byte[]> ExportDonationsToExcelAsync(DateTime? fromDate = null, DateTime? toDate = null, int? categoryId = null);
        Task<byte[]> ExportMembersToExcelAsync(string? search = null, bool? isActive = null);
    }
}
