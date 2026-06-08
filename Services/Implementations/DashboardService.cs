using ClubManagement.Domain.DTOs;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context) => _context = context;

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var totalDonations = await _context.Donations
                .Where(d => d.StatusId == 1)
                .SumAsync(d => (decimal?)d.Amount) ?? 0;

            var donationsThisMonth = await _context.Donations
                .Where(d => d.StatusId == 1 && d.DonationDate >= startOfMonth)
                .SumAsync(d => (decimal?)d.Amount) ?? 0;

            var donationsThisMonthCount = await _context.Donations
                .Where(d => d.StatusId == 1 && d.DonationDate >= startOfMonth)
                .CountAsync();

            var totalMembers = await _context.Members.CountAsync();
            var activeMembers = await _context.Members.CountAsync(m => m.IsActive);
            var expiringMembers = await _context.Members
                .CountAsync(m => m.IsActive && m.ExpiryDate <= now.AddDays(30) && m.ExpiryDate > now);

            var activeDonors = await _context.Donations
                .Where(d => d.StatusId == 1)
                .Select(d => d.MemberId)
                .Distinct()
                .CountAsync();

            var donationCount = await _context.Donations.CountAsync(d => d.StatusId == 1);
            var averageDonation = donationCount > 0 ? totalDonations / donationCount : 0;

            var pendingCount = await _context.Donations.CountAsync(d => d.StatusId == 2);
            var upcomingEvents = await _context.Events.CountAsync(e => e.IsActive && e.EventDate >= now);
            var unreadNotifications = await _context.Notifications.CountAsync(n => !n.IsRead);

            var recentDonations = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .Where(d => d.StatusId == 1)
                .OrderByDescending(d => d.DonationDate)
                .Take(10)
                .Select(d => new RecentDonationDto
                {
                    DonationId = d.Id,
                    MemberId = d.MemberId,
                    MemberName = d.Member.FirstName + " " + d.Member.LastName,
                    MemberEmail = d.Member.Email,
                    Amount = d.Amount,
                    DonationDate = d.DonationDate,
                    Category = d.Category.CategoryName,
                    PaymentMethod = d.PaymentMethodLookup.MethodName,
                    Status = d.Status.StatusName
                })
                .ToListAsync();

            var monthlyTrends = await GetMonthlyTrendsAsync(6);

            return new DashboardSummaryDto
            {
                TotalDonations = totalDonations,
                TotalMembers = totalMembers,
                ActiveMembers = activeMembers,
                ExpiringMembers = expiringMembers,
                ActiveDonors = activeDonors,
                DonationsThisMonth = donationsThisMonth,
                DonationsThisMonthCount = donationsThisMonthCount,
                AverageDonation = averageDonation,
                PendingDonationsCount = pendingCount,
                UpcomingEventsCount = upcomingEvents,
                UnreadNotificationsCount = unreadNotifications,
                RecentDonations = recentDonations,
                MonthlyTrends = monthlyTrends
            };
        }

        public async Task<DonationAnalyticsDto> GetAnalyticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Donations
                .Include(d => d.Category)
                .Include(d => d.Member)
                .Where(d => d.StatusId == 1)
                .AsQueryable();

            if (fromDate.HasValue)
                query = query.Where(d => d.DonationDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(d => d.DonationDate <= toDate.Value);

            var donations = await query.ToListAsync();

            var totalDonations = donations.Sum(d => d.Amount);
            var totalDonors = donations.Select(d => d.MemberId).Distinct().Count();
            var totalDonationsCount = donations.Count;

            var monthlyTrends = donations
                .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyTrendDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Amount = g.Sum(d => d.Amount),
                    Count = g.Count(),
                    PercentageChange = 0
                })
                .ToList();

            for (int i = 1; i < monthlyTrends.Count; i++)
            {
                var prev = monthlyTrends[i - 1].Amount;
                monthlyTrends[i].PercentageChange = prev > 0
                    ? Math.Round((monthlyTrends[i].Amount - prev) / prev * 100, 2)
                    : 0;
            }

            var categoryBreakdown = donations
                .GroupBy(d => d.Category.CategoryName)
                .Select(g => new CategoryBreakdownDto
                {
                    CategoryName = g.Key,
                    Amount = g.Sum(d => d.Amount),
                    Count = g.Count(),
                    Percentage = totalDonations > 0 ? (int)Math.Round(g.Sum(d => d.Amount) / totalDonations * 100) : 0
                })
                .ToList();

            var topDonors = donations
                .GroupBy(d => new { d.MemberId, Name = d.Member.FirstName + " " + d.Member.LastName, d.Member.Email })
                .OrderByDescending(g => g.Sum(d => d.Amount))
                .Take(10)
                .Select(g => new TopDonorDto
                {
                    MemberId = g.Key.MemberId,
                    Name = g.Key.Name,
                    Email = g.Key.Email,
                    TotalDonation = g.Sum(d => d.Amount),
                    LastDonation = g.Max(d => d.DonationDate),
                    DonationCount = g.Count(),
                    LargestCategory = g.GroupBy(d => d.Category.CategoryName)
                        .OrderByDescending(cg => cg.Sum(d => d.Amount))
                        .Select(cg => cg.Key)
                        .FirstOrDefault()
                })
                .ToList();

            var dailyDonations = donations
                .GroupBy(d => d.DonationDate.Date)
                .OrderBy(g => g.Key)
                .Select(g => new DailyDonationDto
                {
                    Date = g.Key,
                    Amount = g.Sum(d => d.Amount),
                    Count = g.Count()
                })
                .ToList();

            return new DonationAnalyticsDto
            {
                TotalDonations = totalDonations,
                TotalDonors = totalDonors,
                TotalDonationsCount = totalDonationsCount,
                MonthlyTrends = monthlyTrends,
                CategoryBreakdown = categoryBreakdown,
                TopDonors = topDonors,
                DailyDonations = dailyDonations
            };
        }

        public async Task<List<TopDonorDto>> GetTopDonorsAsync(int count = 10)
        {
            return await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Where(d => d.StatusId == 1)
                .GroupBy(d => new { d.MemberId, Name = d.Member.FirstName + " " + d.Member.LastName, d.Member.Email, d.Member.ProfilePhotoUrl })
                .OrderByDescending(g => g.Sum(d => d.Amount))
                .Take(count)
                .Select(g => new TopDonorDto
                {
                    MemberId = g.Key.MemberId,
                    Name = g.Key.Name,
                    Email = g.Key.Email,
                    Phone = _context.Members.Where(m => m.MemberId == g.Key.MemberId).Select(m => m.PhoneNumber).FirstOrDefault(),
                    ProfilePhotoUrl = g.Key.ProfilePhotoUrl,
                    TotalDonation = g.Sum(d => d.Amount),
                    LastDonation = g.Max(d => d.DonationDate),
                    DonationCount = g.Count(),
                    LargestCategory = g.GroupBy(d => d.Category.CategoryName)
                        .OrderByDescending(cg => cg.Sum(d => d.Amount))
                        .Select(cg => cg.Key)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        public async Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int months = 12)
        {
            var since = DateTime.UtcNow.AddMonths(-months);
            var trends = await _context.Donations
                .Where(d => d.StatusId == 1 && d.DonationDate >= since)
                .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyTrendDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Amount = g.Sum(d => d.Amount),
                    Count = g.Count(),
                    PercentageChange = 0m
                })
                .ToListAsync();

            for (int i = 1; i < trends.Count; i++)
            {
                var prev = trends[i - 1].Amount;
                trends[i].PercentageChange = prev > 0
                    ? Math.Round((trends[i].Amount - prev) / prev * 100, 2)
                    : 0;
            }

            return trends;
        }
    }
}
