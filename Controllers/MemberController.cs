using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
// Controller for member management.
public class MemberController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MemberController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    // GET api/members – list all members (any authenticated user).
    [HttpGet]
    public async Task<IActionResult> GetAllMembers()
    {
        var members = await _memberService.GetAllMembersAsync();
        return Ok(members);
    }

    // POST api/members – create a user account + member profile with roles (Admin only).
    [HttpPost]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> CreateMember([FromBody] CreateMemberWithAccountDto dto)
    {
        try
        {
            var member = await _memberService.CreateMemberWithAccountAsync(dto);
            return CreatedAtAction(nameof(GetAllMembers), new
            {
                member.MemberId,
                member.FirstName,
                member.LastName,
                member.Email
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
