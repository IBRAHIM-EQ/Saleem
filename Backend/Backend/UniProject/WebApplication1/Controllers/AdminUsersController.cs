using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Allergies)
                .OrderByDescending(u => u.Id)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Role = u.Role,
                    OnboardingComplete = u.OnboardingComplete,
                    AllergiesCount = u.Allergies.Count
                })
                .ToListAsync();
            Console.WriteLine("Users count: " + users.Count);

            return Ok(users);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var allowedRoles = new[] { "User", "Admin", "Doctor" };

            var normalizedRole = dto.Role.Trim();

            if (!allowedRoles.Contains(normalizedRole))
                return BadRequest("Invalid role. Allowed roles: User, Admin, Doctor.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            // --- MULTI-LAYERED SECURITY LOGIC ---
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
            bool isRequesterMasterAdmin = string.Equals(currentUserEmail, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase);

            if (string.Equals(user.Email, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, "The Master Admin account's role cannot be modified.");
            }

            if (!isRequesterMasterAdmin)
            {
                if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(403, "Regular admins cannot modify roles of other admin accounts.");
                }

                if (string.Equals(normalizedRole, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(403, "Regular admins are not authorized to grant Admin privileges.");
                }
            }
            // ------------------------------------

            user.Role = normalizedRole;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User role updated successfully.",
                userId = user.Id,
                role = user.Role
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            // --- MULTI-LAYERED SECURITY LOGIC ---
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
            bool isRequesterMasterAdmin = string.Equals(currentUserEmail, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase);

            if (string.Equals(user.Email, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, "The Master Admin account is immutable and cannot be modified.");
            }

            if (!isRequesterMasterAdmin && string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, "Regular admins cannot modify or delete other admin accounts.");
            }
            // ------------------------------------

            // Check if email is being changed and if it already exists
            if (user.Email != dto.Email && await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email already exists.");
            }

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User updated successfully.",
                userId = user.Id
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Allergies)
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            // --- MULTI-LAYERED SECURITY LOGIC ---
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
            bool isRequesterMasterAdmin = string.Equals(currentUserEmail, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase);

            if (string.Equals(user.Email, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, "The Master Admin account is immutable and cannot be deleted.");
            }

            if (!isRequesterMasterAdmin && string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, "Regular admins cannot modify or delete other admin accounts.");
            }
            // ------------------------------------

            _context.UserAllergies.RemoveRange(user.Allergies);
            _context.RefreshTokens.RemoveRange(user.RefreshTokens);
            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User deleted successfully."
            });
        }
    }
}