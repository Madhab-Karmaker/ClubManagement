using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService) =>
            _reportService = reportService;

        [HttpPost("donations")]
        public async Task<IActionResult> GenerateDonationReport([FromBody] GenerateReportDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            var bytes = await _reportService.GenerateDonationReportAsync(dto);
            return File(bytes, "text/plain", $"donation_report_{DateTime.UtcNow:yyyyMMdd}.txt");
        }

        [HttpPost("members")]
        public async Task<IActionResult> GenerateMemberReport([FromBody] GenerateReportDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            var bytes = await _reportService.GenerateMemberReportAsync(dto);
            return File(bytes, "text/plain", $"member_report_{DateTime.UtcNow:yyyyMMdd}.txt");
        }

        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedReports()
        {
            var reports = await _reportService.GetSavedReportsAsync();
            return Ok(reports);
        }

        [HttpGet("saved/{id:int}")]
        public async Task<IActionResult> GetSavedReport(int id)
        {
            var report = await _reportService.GetSavedReportByIdAsync(id);
            if (report == null) return NotFound(new { message = "Report not found." });
            return Ok(report);
        }

        [HttpDelete("saved/{id:int}")]
        [Authorize(Roles = RoleConstants.Admin)]
        public async Task<IActionResult> DeleteSavedReport(int id)
        {
            var deleted = await _reportService.DeleteSavedReportAsync(id);
            if (!deleted) return NotFound(new { message = "Report not found." });
            return Ok(new { message = "Report deleted successfully." });
        }
    }
}
