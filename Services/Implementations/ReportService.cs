using System.Globalization;
using System.Text;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context) => _context = context;

        public async Task<byte[]> GenerateDonationReportAsync(GenerateReportDto dto)
        {
            var query = _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .Where(d => d.StatusId == 1)
                .AsQueryable();

            if (dto.FromDate.HasValue) { var from = EnsureUtc(dto.FromDate.Value); query = query.Where(d => d.DonationDate >= from); }
            if (dto.ToDate.HasValue) { var to = EnsureUtc(dto.ToDate.Value); query = query.Where(d => d.DonationDate <= to); }
            if (dto.MemberId.HasValue) query = query.Where(d => d.MemberId == dto.MemberId.Value);
            if (dto.CategoryId.HasValue) query = query.Where(d => d.CategoryId == dto.CategoryId.Value);

            var donations = await query.OrderByDescending(d => d.DonationDate).ToListAsync();

            var totalAmount = donations.Sum(d => d.Amount);
            var totalCount = donations.Count;

            var sb = new StringBuilder();
            sb.AppendLine("=== Donation Report ===");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            if (dto.FromDate.HasValue)
                sb.AppendLine($"From: {dto.FromDate.Value:yyyy-MM-dd}");
            if (dto.ToDate.HasValue)
                sb.AppendLine($"To: {dto.ToDate.Value:yyyy-MM-dd}");
            sb.AppendLine();
            sb.AppendLine($"Total Donations: {totalCount}");
            sb.AppendLine($"Total Amount: {totalAmount:F2}");
            sb.AppendLine($"Average: {(totalCount > 0 ? totalAmount / totalCount : 0):F2}");
            sb.AppendLine();
            sb.AppendLine("--- Details ---");
            sb.AppendLine("ID,Member,Amount,Category,PaymentMethod,Date,Reference");

            foreach (var d in donations)
            {
                sb.AppendLine($"{d.Id},\"{d.Member.FirstName} {d.Member.LastName}\",{d.Amount:F2},\"{d.Category?.CategoryName}\",\"{d.PaymentMethodLookup?.MethodName}\",{d.DonationDate:yyyy-MM-dd},{d.ReferenceNumber}");
            }

            // Save report
            var report = new SavedReport
            {
                ReportName = dto.ReportName,
                ReportType = "Donation",
                Parameters = System.Text.Json.JsonSerializer.Serialize(dto)
            };
            _context.SavedReports.Add(report);
            await _context.SaveChangesAsync();

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public async Task<byte[]> GenerateMemberReportAsync(GenerateReportDto dto)
        {
            var query = _context.Members.AsQueryable();

            if (dto.MemberId.HasValue)
                query = query.Where(m => m.MemberId == dto.MemberId.Value);

            var members = await query.OrderBy(m => m.LastName).ThenBy(m => m.FirstName).ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("=== Member Report ===");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            sb.AppendLine();
            sb.AppendLine($"Total Members: {members.Count}");
            sb.AppendLine($"Active: {members.Count(m => m.IsActive)}");
            sb.AppendLine($"Inactive: {members.Count(m => !m.IsActive)}");
            sb.AppendLine();
            sb.AppendLine("--- Details ---");
            sb.AppendLine("ID,Name,Email,Phone,JoinDate,ExpiryDate,Active");

            foreach (var m in members)
            {
                sb.AppendLine($"{m.MemberId},\"{m.FirstName} {m.LastName}\",\"{m.Email}\",\"{m.PhoneNumber}\",{m.JoinDate:yyyy-MM-dd},{m.ExpiryDate:yyyy-MM-dd},{m.IsActive}");
            }

            var report = new SavedReport
            {
                ReportName = dto.ReportName,
                ReportType = "Member",
                Parameters = System.Text.Json.JsonSerializer.Serialize(dto)
            };
            _context.SavedReports.Add(report);
            await _context.SaveChangesAsync();

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public async Task<List<ReportDto>> GetSavedReportsAsync()
        {
            return await _context.SavedReports
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReportDto
                {
                    SavedReportId = r.SavedReportId,
                    ReportName = r.ReportName,
                    ReportType = r.ReportType,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ReportDto?> GetSavedReportByIdAsync(int id)
        {
            return await _context.SavedReports
                .Where(r => r.SavedReportId == id)
                .Select(r => new ReportDto
                {
                    SavedReportId = r.SavedReportId,
                    ReportName = r.ReportName,
                    ReportType = r.ReportType,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteSavedReportAsync(int id)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return false;

            _context.SavedReports.Remove(report);
            await _context.SaveChangesAsync();
            return true;
        }
        private static DateTime EnsureUtc(DateTime dt) =>
            dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }
}
