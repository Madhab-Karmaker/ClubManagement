using System.Security.Claims;
using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/membership")]
    [Authorize]
    public class MembershipController : ControllerBase
    {
        private readonly IMembershipFeeService _membershipFeeService;

        public MembershipController(IMembershipFeeService membershipFeeService) =>
            _membershipFeeService = membershipFeeService;

        // ── Fees ──

        [HttpGet("fees/{memberId:int}")]
        public async Task<IActionResult> GetFees(int memberId)
        {
            var fees = await _membershipFeeService.GetByMemberIdAsync(memberId);
            return Ok(fees);
        }

        [HttpGet("fees/pending")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> GetPendingFees()
        {
            var fees = await _membershipFeeService.GetPendingFeesAsync();
            return Ok(fees);
        }

        [HttpPost("fees")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> CreateFee([FromBody] CreateMembershipFeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            try
            {
                var fee = await _membershipFeeService.CreateFeeAsync(dto);
                return CreatedAtAction(nameof(GetFees), new { memberId = dto.MemberId }, fee);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("fees/{feeId:int}/pay")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> MarkAsPaid(int feeId, [FromQuery] int donationId)
        {
            try
            {
                await _membershipFeeService.MarkAsPaidAsync(feeId, donationId);
                return Ok(new { message = "Fee marked as paid." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("fees/{feeId:int}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> DeleteFee(int feeId)
        {
            var deleted = await _membershipFeeService.DeleteFeeAsync(feeId);
            if (!deleted) return NotFound(new { message = "Fee not found." });
            return Ok(new { message = "Fee deleted successfully." });
        }

        // ── Renewals ──

        [HttpPost("renew")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> RenewMembership([FromBody] RenewMembershipDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var renewal = await _membershipFeeService.RenewMembershipAsync(dto, userId);
                return Ok(renewal);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("renewals/{memberId:int}")]
        public async Task<IActionResult> GetRenewalHistory(int memberId)
        {
            var history = await _membershipFeeService.GetRenewalHistoryAsync(memberId);
            return Ok(history);
        }

        // ── Expiring ──

        [HttpGet("expiring")]
        [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
        public async Task<IActionResult> GetExpiringMembers([FromQuery] int withinDays = 30)
        {
            var members = await _membershipFeeService.GetExpiringMembersAsync(withinDays);
            return Ok(members);
        }
    }
}
