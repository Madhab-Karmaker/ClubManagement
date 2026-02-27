using Microsoft.AspNetCore.Mvc;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
// Controller for handling user authentication (Login/Logout).
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    // Initializes a new instance of the AuthController.
    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    // Authenticates a user and starts a session.
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var isValid = await _userService.ValidateUserPasswordAsync(dto.Username, dto.Password);

        if (!isValid)
            return Unauthorized(new { message = "Invalid username or password" });

        // Optional: token generate if JWT
        // var token = await _userService.LoginAsync(dto);

        return Ok(new { message = "Login successful" });
    }

    // Logs out the current user and ends the session.
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _userService.LogoutAsync();
        return Ok(new { message = "Logout successful" });
    }
}