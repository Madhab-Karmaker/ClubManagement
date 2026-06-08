using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
        Task<DonationAnalyticsDto> GetAnalyticsAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<List<TopDonorDto>> GetTopDonorsAsync(int count = 10);
        Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int months = 12);
    }
}
