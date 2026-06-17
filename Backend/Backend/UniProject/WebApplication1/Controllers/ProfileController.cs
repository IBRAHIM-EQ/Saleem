using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Model;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var user = await _context.Users
                .Include(u => u.Allergies)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);

            if (user == null)
                return NotFound("User not found.");

            var response = new UserProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                OnboardingComplete = user.OnboardingComplete,
                Allergies = user.Allergies.Select(a => new UserAllergyDto
                {
                    AllergenKey = a.AllergenKey,
                    Severity = a.Severity
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPut("allergies")]
        public async Task<IActionResult> UpdateMyAllergies(UpdateUserAllergiesDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var user = await _context.Users
                .Include(u => u.Allergies)
                .FirstOrDefaultAsync(u => u.Id == userId.Value);

            if (user == null)
                return NotFound("User not found.");

            _context.UserAllergies.RemoveRange(user.Allergies);

            var newAllergies = dto.Allergies.Select(a => new UserAllergy
            {
                UserId = user.Id,
                AllergenKey = a.AllergenKey,
                Severity = a.Severity,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.UserAllergies.AddRangeAsync(newAllergies);

            user.OnboardingComplete = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Allergies updated successfully.",
                allergies = newAllergies.Select(a => new UserAllergyDto
                {
                    AllergenKey = a.AllergenKey,
                    Severity = a.Severity
                })
            });
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return null;

            if (!int.TryParse(userIdClaim, out int userId))
                return null;

            return userId;
        }
    }
}