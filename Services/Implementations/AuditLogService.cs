using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;

        public AuditLogService(AppDbContext context) => _context = context;

        public async Task<List<AuditLogDto>> GetByDonationIdAsync(int donationId)
        {
            return await _context.DonationAuditLogs
                .Where(a => a.DonationId == donationId)
                .OrderByDescending(a => a.ChangedAt)
                .Select(a => new AuditLogDto
                {
                    AuditId = a.AuditId,
                    DonationId = a.DonationId,
                    ActionType = a.ActionType,
                    OldValue = a.OldValue,
                    NewValue = a.NewValue,
                    ChangedBy = a.ChangedBy,
                    ChangedAt = a.ChangedAt
                })
                .ToListAsync();
        }

        public async Task<List<AuditLogDto>> GetAllAsync(int page = 1, int pageSize = 50)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);

            return await _context.DonationAuditLogs
                .OrderByDescending(a => a.ChangedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    AuditId = a.AuditId,
                    DonationId = a.DonationId,
                    ActionType = a.ActionType,
                    OldValue = a.OldValue,
                    NewValue = a.NewValue,
                    ChangedBy = a.ChangedBy,
                    ChangedAt = a.ChangedAt
                })
                .ToListAsync();
        }

        public async Task LogAsync(int donationId, string actionType, string? oldValue, string? newValue, string? changedBy = null)
        {
            var audit = new DonationAuditLog
            {
                DonationId = donationId,
                ActionType = actionType,
                OldValue = oldValue,
                NewValue = newValue,
                ChangedBy = changedBy,
                ChangedAt = DateTime.UtcNow
            };

            _context.DonationAuditLogs.Add(audit);
            await _context.SaveChangesAsync();
        }
    }
}
