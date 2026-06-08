using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context) => _context = context;

        public async Task<List<NotificationDto>> GetByMemberIdAsync(int memberId, bool unreadOnly = false)
        {
            var query = _context.Notifications
                .Where(n => n.MemberId == memberId)
                .AsQueryable();

            if (unreadOnly)
                query = query.Where(n => !n.IsRead);

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                    SentAt = n.SentAt
                })
                .ToListAsync();
        }

        public async Task<List<NotificationDto>> GetByUserIdAsync(string userId, bool unreadOnly = false)
        {
            var query = _context.Notifications
                .Where(n => n.UserId == userId)
                .AsQueryable();

            if (unreadOnly)
                query = query.Where(n => !n.IsRead);

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                    SentAt = n.SentAt
                })
                .ToListAsync();
        }

        public async Task<List<NotificationDto>> GetUnreadAsync()
        {
            return await _context.Notifications
                .Where(n => !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                    SentAt = n.SentAt
                })
                .ToListAsync();
        }

        public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                MemberId = dto.MemberId,
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return new NotificationDto
            {
                NotificationId = notification.NotificationId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int? memberId = null, string? userId = null)
        {
            IQueryable<Notification> query = _context.Notifications.Where(n => !n.IsRead);

            if (memberId.HasValue)
                query = query.Where(n => n.MemberId == memberId);
            else if (!string.IsNullOrEmpty(userId))
                query = query.Where(n => n.UserId == userId);

            var count = await query.CountAsync();
            if (count == 0) return false;

            await query.ForEachAsync(n => n.IsRead = true);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(int? memberId = null, string? userId = null)
        {
            var query = _context.Notifications.Where(n => !n.IsRead);

            if (memberId.HasValue)
                query = query.Where(n => n.MemberId == memberId);
            else if (!string.IsNullOrEmpty(userId))
                query = query.Where(n => n.UserId == userId);

            return await query.CountAsync();
        }

        public async Task<bool> DeleteAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
