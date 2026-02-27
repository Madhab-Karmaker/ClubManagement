using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;
using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using ClubManagement.Domain.Constants;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = RoleConstants.Admin)] // Uncomment this after seeding Admin role
    // Controller for managing roles and role assignments.
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User> _userManager;
        private readonly IUserService _userService;

        // Initializes a new instance of the RoleController.
        public RoleController(RoleManager<IdentityRole> roleManager, UserManager<User> userManager, IUserService userService)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _userService = userService;
        }

        // Creates a new role in the system.
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleName))
                return BadRequest("Role name is required");

            var roleExists = await _roleManager.RoleExistsAsync(dto.RoleName);
            if (roleExists)
                return BadRequest("Role already exists");

            var result = await _roleManager.CreateAsync(new IdentityRole(dto.RoleName));

            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' created successfully" });

            return BadRequest(result.Errors);
        }

        // Retrieves all roles defined in the system.
        [HttpGet]
        public IActionResult GetRoles()
        {
            var roles = _roleManager.Roles.ToList();
            return Ok(roles);
        }

        // Deletes a specific role by name.
        [HttpDelete("{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
                return NotFound("Role not found");

            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' deleted successfully" });

            return BadRequest(result.Errors);
        }

        // Assigns a role to a user.
        [HttpPost("assign")]
        public async Task<IActionResult> AssignRole([FromBody] UserRoleDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Username);
            if (user == null)
                return NotFound("User not found");

            var roleExists = await _roleManager.RoleExistsAsync(dto.RoleName);
            if (!roleExists)
                return BadRequest("Role does not exist");

            var result = await _userService.AssignRoleAsync(user, dto.RoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' assigned to user '{dto.Username}'" });

            return BadRequest(result.Errors);
        }

        // Removes a role from a user.
        [HttpPost("remove")]
        public async Task<IActionResult> RemoveRole([FromBody] UserRoleDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Username);
            if (user == null)
                return NotFound("User not found");

            var result = await _userService.RemoveRoleAsync(user, dto.RoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' removed from user '{dto.Username}'" });

            return BadRequest(result.Errors);
        }
    }
}
