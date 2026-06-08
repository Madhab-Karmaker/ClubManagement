using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService) =>
            _dashboardService = dashboardService;

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _dashboardService.GetSummaryAsync();
            return Ok(summary);
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var analytics = await _dashboardService.GetAnalyticsAsync(fromDate, toDate);
            return Ok(analytics);
        }

        [HttpGet("top-donors")]
        public async Task<IActionResult> GetTopDonors([FromQuery] int count = 10)
        {
            var donors = await _dashboardService.GetTopDonorsAsync(count);
            return Ok(donors);
        }

        [HttpGet("monthly-trends")]
        public async Task<IActionResult> GetMonthlyTrends([FromQuery] int months = 12)
        {
            var trends = await _dashboardService.GetMonthlyTrendsAsync(months);
            return Ok(trends);
        }
    }
}
