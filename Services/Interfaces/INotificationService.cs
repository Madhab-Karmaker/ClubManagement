using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetByMemberIdAsync(int memberId, bool unreadOnly = false);
        Task<List<NotificationDto>> GetByUserIdAsync(string userId, bool unreadOnly = false);
        Task<List<NotificationDto>> GetUnreadAsync();
        Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadAsync(int? memberId = null, string? userId = null);
        Task<int> GetUnreadCountAsync(int? memberId = null, string? userId = null);
        Task<bool> DeleteAsync(int notificationId);
    }
}
