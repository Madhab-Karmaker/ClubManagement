using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
// Controller for managing user accounts and registration.
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    // Initializes a new instance of the UserController.
    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // 🔹 Register User
    // Registers a new user with the default Member role.
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);
            return Ok(new
            {
                message = "User registered successfully",
                username = user.UserName,
                email = user.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 🔹 Get All Users
    // Retrieves a list of all registered users.
    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] bool includeDeleted = false)
    {
        var users = await _userService.GetAllUsersAsync(includeDeleted);
        return Ok(users);
    }

    // 🔹 Delete User (Soft Delete)
    // Deletes a user account (soft delete).
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var deleted = await _userService.DeleteUserAsync(id);
        if (!deleted)
            return NotFound(new { message = "User not found or could not be deleted" });

        return Ok(new { message = "User deleted successfully (soft delete)" });
    }
}