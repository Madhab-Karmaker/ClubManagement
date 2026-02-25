using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // 🔹 Register User
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);

            return Ok(new
            {
                message = "User created successfully",
                user
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 🔹 Get All Users
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }
}