using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IEventService
    {
        Task<List<EventDto>> GetAllAsync(bool includeInactive = false);
        Task<EventDto?> GetByIdAsync(int id);
        Task<EventDto> CreateAsync(CreateEventDto dto, string? createdByUserId = null);
        Task<EventDto> UpdateAsync(int id, UpdateEventDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> RegisterAttendeeAsync(int eventId, int memberId);
        Task<bool> UnregisterAttendeeAsync(int eventId, int memberId);
        Task<bool> MarkAttendanceAsync(int eventId, int memberId, bool attended);
        Task<List<MemberSearchHitDto>> GetAttendeesAsync(int eventId);
        Task<List<EventDto>> GetUpcomingAsync(int count = 10);
    }
}
