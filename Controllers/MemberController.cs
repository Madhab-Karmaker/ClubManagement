using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MemberController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MemberController(IMemberService memberService) => _memberService = memberService;

    // GET /api/member?search=&role=&isActive=&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetMembers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var result = await _memberService.GetPagedMembersAsync(search, role, isActive, page, pageSize);
        return Ok(result);
    }

    // GET /api/member/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMember(int id)
    {
        var member = await _memberService.GetMemberByIdAsync(id);
        if (member == null) return NotFound(new { message = "Member not found." });
        return Ok(member);
    }

    // POST /api/member  (Admin or Manager)
    [HttpPost]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public async Task<IActionResult> CreateMember([FromBody] CreateMemberWithAccountDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(new { message = string.Join(" ", errors) });
        }
        try
        {
            var member = await _memberService.CreateMemberWithAccountAsync(dto);
            return CreatedAtAction(nameof(GetMember), new { id = member.MemberId }, member);
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message });
        }
    }

    // PUT /api/member/{id}  (Admin or Manager)
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public async Task<IActionResult> UpdateMember(int id, [FromBody] UpdateMemberDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return BadRequest(new { message = string.Join(" ", errors) });
        }
        try
        {
            var member = await _memberService.UpdateMemberByIdAsync(id, dto);
            if (member == null) return NotFound(new { message = "Member not found." });
            return Ok(member);
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message });
        }
    }

    // DELETE /api/member/{id}  (Admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> DeleteMember(int id)
    {
        var deleted = await _memberService.DeleteMemberAsync(id);
        if (!deleted) return NotFound(new { message = "Member not found." });
        return Ok(new { message = "Member deleted successfully." });
    }
}
