using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/admin/dashboard")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new AdminDashboardStatsDto
            {
                TotalUsers = await _context.Users.CountAsync(),

                TotalProducts = await _context.Products.CountAsync(),

                TotalProductBrands = await _context.ProductBrands.CountAsync(),

                TotalStores = await _context.Stores.CountAsync(),

                TotalSpecialists = await _context.Specialists.CountAsync(),

                HiddenProducts = await _context.Products.CountAsync(p => p.IsHidden),

                HiddenProductBrands = await _context.ProductBrands.CountAsync(b => b.IsHidden),

                HiddenStores = await _context.Stores.CountAsync(s => s.IsHidden),

                HiddenSpecialists = await _context.Specialists.CountAsync(s => s.IsHidden)
            };

            return Ok(stats);
        }
    }
}