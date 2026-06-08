using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/export")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportController(IExportService exportService) =>
            _exportService = exportService;

        [HttpGet("donations/csv")]
        public async Task<IActionResult> ExportDonationsCsv(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int? categoryId)
        {
            var bytes = await _exportService.ExportDonationsToCsvAsync(fromDate, toDate, categoryId);
            return File(bytes, "text/csv", $"donations_{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        [HttpGet("donations/excel")]
        public async Task<IActionResult> ExportDonationsExcel(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int? categoryId)
        {
            var bytes = await _exportService.ExportDonationsToExcelAsync(fromDate, toDate, categoryId);
            return File(bytes, "application/vnd.ms-excel", $"donations_{DateTime.UtcNow:yyyyMMdd}.xls");
        }

        [HttpGet("members/csv")]
        public async Task<IActionResult> ExportMembersCsv(
            [FromQuery] string? search,
            [FromQuery] bool? isActive)
        {
            var bytes = await _exportService.ExportMembersToCsvAsync(search, isActive);
            return File(bytes, "text/csv", $"members_{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        [HttpGet("members/excel")]
        public async Task<IActionResult> ExportMembersExcel(
            [FromQuery] string? search,
            [FromQuery] bool? isActive)
        {
            var bytes = await _exportService.ExportMembersToExcelAsync(search, isActive);
            return File(bytes, "application/vnd.ms-excel", $"members_{DateTime.UtcNow:yyyyMMdd}.xls");
        }
    }
}
