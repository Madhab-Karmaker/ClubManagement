using Microsoft.AspNetCore.Mvc;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);
            return Ok(new
            {
                message = "User registered successfully",
                username = user.UserName, email = user.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
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
}