using System.Security.Claims;
using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService) => _eventService = eventService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
        {
            var events = await _eventService.GetAllAsync(includeInactive);
            return Ok(events);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming([FromQuery] int count = 10)
        {
            var events = await _eventService.GetUpcomingAsync(count);
            return Ok(events);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var ev = await _eventService.GetByIdAsync(id);
                if (ev == null) return NotFound(new { message = $"Event with ID {id} not found." });
                return Ok(ev);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ev = await _eventService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = ev.EventId }, ev);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEventDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            try
            {
                var ev = await _eventService.UpdateAsync(id, dto);
                return Ok(ev);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _eventService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = $"Event with ID {id} not found." });
            return Ok(new { message = "Event deleted successfully." });
        }

        [HttpPost("{eventId:int}/attendees/{memberId:int}")]
        public async Task<IActionResult> RegisterAttendee(int eventId, int memberId)
        {
            try
            {
                var result = await _eventService.RegisterAttendeeAsync(eventId, memberId);
                if (!result) return BadRequest(new { message = "Member is already registered for this event." });
                return Ok(new { message = "Attendee registered successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{eventId:int}/attendees/{memberId:int}")]
        public async Task<IActionResult> UnregisterAttendee(int eventId, int memberId)
        {
            var result = await _eventService.UnregisterAttendeeAsync(eventId, memberId);
            if (!result) return NotFound(new { message = "Attendee not found." });
            return Ok(new { message = "Attendee unregistered successfully." });
        }

        [HttpPut("{eventId:int}/attendees/{memberId:int}/attendance")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> MarkAttendance(int eventId, int memberId, [FromQuery] bool attended = true)
        {
            try
            {
                await _eventService.MarkAttendanceAsync(eventId, memberId, attended);
                return Ok(new { message = $"Attendance marked as {(attended ? "present" : "absent")}." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{eventId:int}/attendees")]
        public async Task<IActionResult> GetAttendees(int eventId)
        {
            var attendees = await _eventService.GetAttendeesAsync(eventId);
            return Ok(attendees);
        }
    }
}
