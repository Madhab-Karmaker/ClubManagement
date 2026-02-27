using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Services.Interfaces;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    // Controller for managing the logged-in user's member profile.
    public class ProfileController : ControllerBase
    {
        private readonly IMemberService _memberService;

        // Initializes a new instance of the ProfileController.
        public ProfileController(IMemberService memberService)
        {
            _memberService = memberService;
        }
        // Gets the member profile associated with a specific user ID.
        [HttpGet("me")]
        public async Task<Member?> GetMyMemberInfo(string userId)
        {
            var member = await _memberService.GetMemberByUserIdAsync(userId);
            if (member == null)
            {
                return null;
            }
            return member;
        }

        // Creates a member profile for the currently authenticated user.
        [HttpPost]
        public async Task<IActionResult> CreateMemberInfo(CreateMemberDto dto) { 
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }
            var existingMember = await _memberService.GetMemberByUserIdAsync(userId);
            if (existingMember != null)
            {
                return BadRequest(new { message = "Member profile already exists for this user" });
            }
            var member = await _memberService.CreateMemberAsync(userId, dto);
            return Ok(member);
        }

        // Updates the member profile for a specific user ID.
        [HttpPut]
        public async Task<IActionResult> UpdateMyMemberInfo(string userId, UpdateMemberDto dto)
        {
            var updatedMember = await _memberService.UpdateMemberAsync(userId, dto);
            if (updatedMember == null)
            {
                return NotFound(new { message = "Member profile not found" });
            }
            return Ok(updatedMember);

        }

    }
}
