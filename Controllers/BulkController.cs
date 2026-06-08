using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/bulk")]
    [Authorize(Roles = RoleConstants.Admin)]
    public class BulkController : ControllerBase
    {
        private readonly IBulkOperationService _bulkService;

        public BulkController(IBulkOperationService bulkService) =>
            _bulkService = bulkService;

        [HttpPost("members/delete")]
        public async Task<IActionResult> BulkDeleteMembers([FromBody] BulkOperationDto dto)
        {
            if (dto.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided." });

            var result = await _bulkService.BulkDeleteMembersAsync(dto.Ids);
            return Ok(result);
        }

        [HttpPost("donations/delete")]
        public async Task<IActionResult> BulkDeleteDonations([FromBody] BulkOperationDto dto)
        {
            if (dto.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided." });

            var result = await _bulkService.BulkDeleteDonationsAsync(dto.Ids);
            return Ok(result);
        }

        [HttpPut("members/status")]
        public async Task<IActionResult> BulkUpdateMemberStatus([FromBody] BulkOperationDto dto)
        {
            if (dto.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided." });

            var isActive = dto.Parameters?.ContainsKey("isActive") == true
                ? Convert.ToBoolean(dto.Parameters["isActive"])
                : true;

            var result = await _bulkService.BulkUpdateMemberStatusAsync(dto.Ids, isActive);
            return Ok(result);
        }

        [HttpPut("donations/status")]
        public async Task<IActionResult> BulkUpdateDonationStatus([FromBody] BulkOperationDto dto)
        {
            if (dto.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided." });

            var statusId = dto.Parameters?.ContainsKey("statusId") == true
                ? Convert.ToInt32(dto.Parameters["statusId"])
                : 1;

            var result = await _bulkService.BulkUpdateDonationStatusAsync(dto.Ids, statusId);
            return Ok(result);
        }
    }
}
