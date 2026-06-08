using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context) => _context = context;

        public async Task<List<EventDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.Events.AsQueryable();
            if (!includeInactive)
                query = query.Where(e => e.IsActive);

            return await query
                .OrderByDescending(e => e.EventDate)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Budget = e.Budget,
                    MaxAttendees = e.MaxAttendees,
                    AttendeeCount = e.Attendees.Count,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<EventDto?> GetByIdAsync(int id)
        {
            return await _context.Events
                .Where(e => e.EventId == id)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Budget = e.Budget,
                    MaxAttendees = e.MaxAttendees,
                    AttendeeCount = e.Attendees.Count,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<EventDto> CreateAsync(CreateEventDto dto, string? createdByUserId = null)
        {
            var ev = new Event
            {
                EventName = dto.EventName,
                Description = dto.Description,
                EventDate = dto.EventDate,
                EndDate = dto.EndDate,
                Location = dto.Location,
                Budget = dto.Budget,
                MaxAttendees = dto.MaxAttendees,
                CreatedByUserId = createdByUserId
            };

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return new EventDto
            {
                EventId = ev.EventId,
                EventName = ev.EventName,
                Description = ev.Description,
                EventDate = ev.EventDate,
                EndDate = ev.EndDate,
                Location = ev.Location,
                Budget = ev.Budget,
                MaxAttendees = ev.MaxAttendees,
                IsActive = ev.IsActive,
                CreatedAt = ev.CreatedAt
            };
        }

        public async Task<EventDto> UpdateAsync(int id, UpdateEventDto dto)
        {
            var ev = await _context.Events.FindAsync(id)
                ?? throw new KeyNotFoundException($"Event with ID {id} not found.");

            if (dto.EventName != null) ev.EventName = dto.EventName;
            if (dto.Description != null) ev.Description = dto.Description;
            if (dto.EventDate.HasValue) ev.EventDate = dto.EventDate.Value;
            if (dto.EndDate.HasValue) ev.EndDate = dto.EndDate;
            if (dto.Location != null) ev.Location = dto.Location;
            if (dto.Budget.HasValue) ev.Budget = dto.Budget;
            if (dto.MaxAttendees.HasValue) ev.MaxAttendees = dto.MaxAttendees;
            if (dto.IsActive.HasValue) ev.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            return (await GetByIdAsync(id))!;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null) return false;

            ev.IsDeleted = true;
            ev.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RegisterAttendeeAsync(int eventId, int memberId)
        {
            var ev = await _context.Events.FindAsync(eventId)
                ?? throw new KeyNotFoundException($"Event with ID {eventId} not found.");

            var member = await _context.Members.FindAsync(memberId)
                ?? throw new KeyNotFoundException($"Member with ID {memberId} not found.");

            if (await _context.EventAttendees.AnyAsync(a => a.EventId == eventId && a.MemberId == memberId))
                return false;

            if (ev.MaxAttendees.HasValue)
            {
                var count = await _context.EventAttendees.CountAsync(a => a.EventId == eventId);
                if (count >= ev.MaxAttendees.Value)
                    throw new InvalidOperationException("Event has reached maximum capacity.");
            }

            _context.EventAttendees.Add(new EventAttendee
            {
                EventId = eventId,
                MemberId = memberId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnregisterAttendeeAsync(int eventId, int memberId)
        {
            var attendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == eventId && a.MemberId == memberId);

            if (attendee == null) return false;

            _context.EventAttendees.Remove(attendee);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAttendanceAsync(int eventId, int memberId, bool attended)
        {
            var attendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == eventId && a.MemberId == memberId)
                ?? throw new KeyNotFoundException("Attendee not found for this event.");

            attendee.Attended = attended;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MemberSearchHitDto>> GetAttendeesAsync(int eventId)
        {
            return await _context.EventAttendees
                .Include(a => a.Member)
                .Where(a => a.EventId == eventId)
                .Select(a => new MemberSearchHitDto
                {
                    MemberId = a.MemberId,
                    Name = a.Member.FirstName + " " + a.Member.LastName,
                    Email = a.Member.Email,
                    Phone = a.Member.PhoneNumber,
                    IsActive = a.Member.IsActive
                })
                .ToListAsync();
        }

        public async Task<List<EventDto>> GetUpcomingAsync(int count = 10)
        {
            return await _context.Events
                .Where(e => e.IsActive && e.EventDate >= DateTime.UtcNow)
                .OrderBy(e => e.EventDate)
                .Take(count)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Budget = e.Budget,
                    MaxAttendees = e.MaxAttendees,
                    AttendeeCount = e.Attendees.Count,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();
        }
    }
}
