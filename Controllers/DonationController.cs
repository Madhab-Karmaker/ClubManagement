using System.Security.Claims;
using ClubManagement.Domain.Constants;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
public class DonationController : ControllerBase
{
    private readonly IDonationService _donationService;

    public DonationController(IDonationService donationService) =>
        _donationService = donationService;

    // GET /api/donations?memberId=&categoryId=&paymentMethodId=&fromDate=&toDate=&sortBy=donationDate&sortDir=desc&page=1&pageSize=10
    [HttpGet("api/donations")]
    public async Task<IActionResult> GetDonations([FromQuery] DonationQueryParams query)
    {
        var result = await _donationService.GetPagedDonationsAsync(query);
        return Ok(result);
    }

    // GET /api/donations/{id}
    [HttpGet("api/donations/{id:int}")]
    public async Task<IActionResult> GetDonation(int id)
    {
        var donation = await _donationService.GetDonationByIdAsync(id);
        if (donation is null)
            return NotFound(new { message = $"Donation with ID {id} was not found." });

        return Ok(donation);
    }

    // GET /api/members/{memberId}/donations?page=1&pageSize=10
    [HttpGet("api/members/{memberId:int}/donations")]
    public async Task<IActionResult> GetMemberDonations(
        int memberId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _donationService.GetDonationsByMemberIdAsync(memberId, page, pageSize);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/donations  (Admin or Manager)
    [HttpPost("api/donations")]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public async Task<IActionResult> CreateDonation([FromBody] CreateDonationDto dto)
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
            var donation = await _donationService.CreateDonationAsync(dto);
            return CreatedAtAction(
                actionName: nameof(GetDonation),
                routeValues: new { id = donation.Id },
                value: donation);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message });
        }
    }

    // PUT /api/donations/{id}  (Admin or Manager)
    [HttpPut("api/donations/{id:int}")]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public async Task<IActionResult> UpdateDonation(int id, [FromBody] UpdateDonationDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(new { message = string.Join(" ", errors) });
        }

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var donation = await _donationService.UpdateDonationAsync(id, dto, userId);
            return Ok(donation);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE /api/donations/{id}  (Admin only)
    [HttpDelete("api/donations/{id:int}")]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> DeleteDonation(int id)
    {
        var deleted = await _donationService.DeleteDonationAsync(id);
        if (!deleted) return NotFound(new { message = $"Donation with ID {id} not found." });
        return Ok(new { message = "Donation deleted successfully." });
    }

    // PATCH /api/donations/{id}/status  (Admin or Manager)
    [HttpPatch("api/donations/{id:int}/status")]
    [Authorize(Roles = $"{RoleConstants.Admin},{RoleConstants.Manager}")]
    public async Task<IActionResult> UpdateDonationStatus(int id, [FromQuery] int statusId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var donation = await _donationService.UpdateDonationStatusAsync(id, statusId, userId);
            return Ok(donation);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
