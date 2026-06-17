using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SpecialistsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SpecialistsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSpecialists()
        {
            var specialists = await _context.Specialists
                .Where(s => !s.IsHidden)
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSpecialistById(int id)
        {
            var specialist = await _context.Specialists
                .Where(s => s.Id == id && !s.IsHidden)
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
                .FirstOrDefaultAsync();

            if (specialist == null)
                return NotFound("Specialist not found.");

            return Ok(specialist);
        }
    }
}