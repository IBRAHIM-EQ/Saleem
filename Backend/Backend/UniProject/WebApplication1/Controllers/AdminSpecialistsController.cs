using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/admin/specialists")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminSpecialistsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminSpecialistsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSpecialistsForAdmin()
        {
            var specialists = await _context.Specialists
                .OrderByDescending(s => s.Id)
                .Select(s => new SpecialistDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Title = s.Title,
                    Bio = s.Bio,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    WhatsAppNumber = s.WhatsAppNumber,
                    ExperienceYears = s.ExperienceYears,
                    Rating = s.Rating,
                    ReviewsCount = s.ReviewsCount,
                    IsHidden = s.IsHidden,
                    ImageUrl = s.ImageUrl
                })
                .ToListAsync();

            return Ok(specialists);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSpecialist(CreateSpecialistDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var specialist = new Specialist
            {
                Name = dto.Name,
                Title = dto.Title,
                Bio = dto.Bio,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                WhatsAppNumber = dto.WhatsAppNumber,
                ExperienceYears = dto.ExperienceYears,
                Rating = dto.Rating,
                ReviewsCount = dto.ReviewsCount,
                ImageUrl = dto.ImageUrl,
                IsHidden = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Specialists.AddAsync(specialist);
            await _context.SaveChangesAsync();

            return Ok(new SpecialistDto
            {
                Id = specialist.Id,
                Name = specialist.Name,
                Title = specialist.Title,
                Bio = specialist.Bio,
                Email = specialist.Email,
                PhoneNumber = specialist.PhoneNumber,
                WhatsAppNumber = specialist.WhatsAppNumber,
                ExperienceYears = specialist.ExperienceYears,
                Rating = specialist.Rating,
                ReviewsCount = specialist.ReviewsCount,
                IsHidden = specialist.IsHidden,
                ImageUrl = specialist.ImageUrl
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpecialist(int id, UpdateSpecialistDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var specialist = await _context.Specialists.FirstOrDefaultAsync(s => s.Id == id);

            if (specialist == null)
                return NotFound("Specialist not found.");

            specialist.Name = dto.Name;
            specialist.Title = dto.Title;
            specialist.Bio = dto.Bio;
            specialist.Email = dto.Email;
            specialist.PhoneNumber = dto.PhoneNumber;
            specialist.WhatsAppNumber = dto.WhatsAppNumber;
            specialist.ExperienceYears = dto.ExperienceYears;
            specialist.Rating = dto.Rating;
            specialist.ReviewsCount = dto.ReviewsCount;
            specialist.IsHidden = dto.IsHidden;
            specialist.ImageUrl = dto.ImageUrl;
            specialist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new SpecialistDto
            {
                Id = specialist.Id,
                Name = specialist.Name,
                Title = specialist.Title,
                Bio = specialist.Bio,
                Email = specialist.Email,
                PhoneNumber = specialist.PhoneNumber,
                WhatsAppNumber = specialist.WhatsAppNumber,
                ExperienceYears = specialist.ExperienceYears,
                Rating = specialist.Rating,
                ReviewsCount = specialist.ReviewsCount,
                IsHidden = specialist.IsHidden,
                ImageUrl = specialist.ImageUrl
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecialist(int id)
        {
            var specialist = await _context.Specialists.FirstOrDefaultAsync(s => s.Id == id);

            if (specialist == null)
                return NotFound("Specialist not found.");

            _context.Specialists.Remove(specialist);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Specialist deleted successfully."
            });
        }

        [HttpPatch("{id}/toggle-hide")]
        public async Task<IActionResult> ToggleHideSpecialist(int id)
        {
            var specialist = await _context.Specialists.FirstOrDefaultAsync(s => s.Id == id);

            if (specialist == null)
                return NotFound("Specialist not found.");

            specialist.IsHidden = !specialist.IsHidden;
            specialist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = specialist.IsHidden ? "Specialist hidden successfully." : "Specialist shown successfully.",
                isHidden = specialist.IsHidden
            });
        }

        [HttpPatch("{id}/hide")]
        public async Task<IActionResult> HideSpecialist(int id)
        {
            var specialist = await _context.Specialists.FirstOrDefaultAsync(s => s.Id == id);

            if (specialist == null)
                return NotFound("Specialist not found.");

            specialist.IsHidden = true;
            specialist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Specialist hidden successfully."
            });
        }

        [HttpPatch("{id}/show")]
        public async Task<IActionResult> ShowSpecialist(int id)
        {
            var specialist = await _context.Specialists.FirstOrDefaultAsync(s => s.Id == id);

            if (specialist == null)
                return NotFound("Specialist not found.");

            specialist.IsHidden = false;
            specialist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Specialist shown successfully."
            });
        }
    }
}