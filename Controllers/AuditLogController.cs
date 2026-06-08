using ClubManagement.Domain.Constants;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize(Roles = RoleConstants.Admin)]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogController(IAuditLogService auditLogService) =>
            _auditLogService = auditLogService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var logs = await _auditLogService.GetAllAsync(page, pageSize);
            return Ok(logs);
        }

        [HttpGet("donations/{donationId:int}")]
        public async Task<IActionResult> GetByDonationId(int donationId)
        {
            var logs = await _auditLogService.GetByDonationIdAsync(donationId);
            return Ok(logs);
        }
    }
}
