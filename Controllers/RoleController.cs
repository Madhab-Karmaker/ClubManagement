using Microsoft.AspNetCore.Mvc;
using ClubManagement.Domain.DTOs;
using ClubManagement.Services.Interfaces;

namespace ClubManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = RoleConstants.Admin)] // Uncomment this after seeding Admin role
    // Controller for overseeing system roles and user-role associations.
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // Creates a new role in the system.
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleName))
                return BadRequest(new { message = "Role name is required" });

            var result = await _roleService.CreateRoleAsync(dto.RoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' created successfully" });

            return BadRequest(result.Errors);
        }

        // Retrieves a list of all roles defined in the system.
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        // Deletes a specific role by name.
        [HttpDelete("{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            var result = await _roleService.DeleteRoleAsync(roleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' deleted successfully" });

            return BadRequest(result.Errors);
        }

        // Assigns a specific role to a user.
        [HttpPost("assign")]
        public async Task<IActionResult> AssignRole([FromBody] UserRoleDto dto)
        {
            var result = await _roleService.AssignRoleAsync(dto.Username, dto.RoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' assigned to user '{dto.Username}'" });

            return BadRequest(result.Errors);
        }

        // Removes a specific role from a user.
        [HttpPost("remove")]
        public async Task<IActionResult> RemoveRole([FromBody] UserRoleDto dto)
        {
            var result = await _roleService.RemoveRoleAsync(dto.Username, dto.RoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{dto.RoleName}' removed from user '{dto.Username}'" });

            return BadRequest(result.Errors);
        }
    }
}
