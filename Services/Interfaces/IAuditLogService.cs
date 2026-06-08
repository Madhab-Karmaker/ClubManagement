using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task<List<AuditLogDto>> GetByDonationIdAsync(int donationId);
        Task<List<AuditLogDto>> GetAllAsync(int page = 1, int pageSize = 50);
        Task LogAsync(int donationId, string actionType, string? oldValue, string? newValue, string? changedBy = null);
    }
}
