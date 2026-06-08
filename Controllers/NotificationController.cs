using System.Security.Claims;
using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService) =>
            _notificationService = notificationService;

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var username = User.Identity?.Name;

            var notifications = await _notificationService.GetByUserIdAsync(userId, unreadOnly);

            var memberIdClaim = User.FindFirstValue("MemberId");
            if (memberIdClaim != null && int.TryParse(memberIdClaim, out var memberId))
            {
                var memberNotifications = await _notificationService.GetByMemberIdAsync(memberId, unreadOnly);
                notifications.AddRange(memberNotifications);
                notifications = notifications.OrderByDescending(n => n.CreatedAt).ToList();
            }

            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var count = await _notificationService.GetUnreadCountAsync(userId: userId);
            return Ok(new { count });
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> Create([FromBody] CreateNotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            var notification = await _notificationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetNotifications), new { }, notification);
        }

        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await _notificationService.MarkAsReadAsync(id);
            if (!result) return NotFound(new { message = "Notification not found." });
            return Ok(new { message = "Notification marked as read." });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            await _notificationService.MarkAllAsReadAsync(userId: userId);
            return Ok(new { message = "All notifications marked as read." });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _notificationService.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Notification not found." });
            return Ok(new { message = "Notification deleted." });
        }
    }
}
