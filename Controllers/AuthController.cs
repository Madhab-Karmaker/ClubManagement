using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    // Registration (Self signup)
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);
            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var isValid = await _userService.ValidateUserPasswordAsync(dto.Username, dto.Password);
        if (!isValid)
            return Unauthorized("Invalid credentials");

        return Ok("Login successful");
        // 🔹 Next step: JWT token return
    }
}