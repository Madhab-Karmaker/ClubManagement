using ClubManagement.Application.Interfaces;
using ClubManagement.Domain.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentMethodController : ControllerBase
    {
        private readonly IPaymentMethodService _paymentMethodService;

        public PaymentMethodController(IPaymentMethodService paymentMethodService)
        {
            _paymentMethodService = paymentMethodService;
        }

        /// <summary>
        /// Get all payment methods
        /// GET: /api/paymentmethod
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllPaymentMethods()
        {
            try
            {
                var paymentMethods = await _paymentMethodService.GetAllPaymentMethodsAsync();
                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving payment methods: {ex.Message}" });
            }
        }

        /// <summary>
        /// Get payment method by ID
        /// GET: /api/paymentmethod/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPaymentMethodById(int id)
        {
            try
            {
                var paymentMethod = await _paymentMethodService.GetPaymentMethodByIdAsync(id);
                return Ok(paymentMethod);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Payment method with ID {id} not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving payment method: {ex.Message}" });
            }
        }

        /// <summary>
        /// Create a new payment method
        /// POST: /api/paymentmethod
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePaymentMethod([FromBody] CreatePaymentMethodDto paymentMethod)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = string.Join(" ", errors) });
                }

                var createdPaymentMethod = await _paymentMethodService.CreatePaymentMethodAsync(paymentMethod);
                return CreatedAtAction(nameof(GetPaymentMethodById), new { id = createdPaymentMethod.Id }, createdPaymentMethod);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                var errorMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = $"Error creating payment method: {ex.Message}. Details: {errorMsg}" });
            }
        }

        /// <summary>
        /// Update an existing payment method
        /// PUT: /api/paymentmethod/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentMethod(int id, [FromBody] UpdatePaymentMethodDto paymentMethod)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = string.Join(" ", errors) });
                }

                var updatedPaymentMethod = await _paymentMethodService.UpdatePaymentMethodAsync(id, paymentMethod);
                return Ok(updatedPaymentMethod);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Payment method with ID {id} not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error updating payment method: {ex.Message}" });
            }
        }

        /// <summary>
        /// Delete a payment method
        /// DELETE: /api/paymentmethod/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePaymentMethod(int id)
        {
            try
            {
                var result = await _paymentMethodService.DeletePaymentMethodAsync(id);
                if (result)
                {
                    return Ok(new { message = $"Payment method with ID {id} deleted successfully." });
                }
                return BadRequest(new { message = "Failed to delete payment method." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Payment method with ID {id} not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting payment method: {ex.Message}" });
            }
        }
    }
}
