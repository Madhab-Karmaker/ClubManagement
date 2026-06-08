using System.Security.Claims;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/receipts")]
    [Authorize]
    public class ReceiptController : ControllerBase
    {
        private readonly IReceiptService _receiptService;

        public ReceiptController(IReceiptService receiptService) =>
            _receiptService = receiptService;

        [HttpPost("donations/{donationId:int}")]
        public async Task<IActionResult> GenerateReceipt(int donationId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var receipt = await _receiptService.GenerateReceiptAsync(donationId, userId);
                return CreatedAtAction(nameof(GetByDonationId), new { donationId }, receipt);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("donations/{donationId:int}")]
        public async Task<IActionResult> GetByDonationId(int donationId)
        {
            var receipt = await _receiptService.GetReceiptByDonationIdAsync(donationId);
            if (receipt == null)
                return NotFound(new { message = "Receipt not found for this donation." });
            return Ok(receipt);
        }

        [HttpGet("number/{receiptNumber}")]
        public async Task<IActionResult> GetByNumber(string receiptNumber)
        {
            var receipt = await _receiptService.GetReceiptByNumberAsync(receiptNumber);
            if (receipt == null)
                return NotFound(new { message = "Receipt not found." });
            return Ok(receipt);
        }

        [HttpGet("members/{memberId:int}")]
        public async Task<IActionResult> GetByMemberId(int memberId)
        {
            var receipts = await _receiptService.GetReceiptsByMemberIdAsync(memberId);
            return Ok(receipts);
        }
    }
}
