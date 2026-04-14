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

        // Retrieves a specific role by ID.
        [HttpGet("{roleId}")]
        public async Task<IActionResult> GetRoleById(string roleId)
        {
            var role = await _roleService.GetRoleByIdAsync(roleId);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            return Ok(role);
        }

        // Retrieves a specific role by name.
        [HttpGet("name/{roleName}")]
        public async Task<IActionResult> GetRoleByName(string roleName)
        {
            var role = await _roleService.GetRoleByNameAsync(roleName);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            return Ok(role);
        }

        // Updates an existing role with a new name.
        [HttpPut]
        public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleId))
                return BadRequest(new { message = "Role ID is required" });

            if (string.IsNullOrWhiteSpace(dto.NewRoleName))
                return BadRequest(new { message = "New role name is required" });

            var result = await _roleService.UpdateRoleAsync(dto.RoleId, dto.NewRoleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role updated successfully to '{dto.NewRoleName}'" });

            return BadRequest(result.Errors);
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
