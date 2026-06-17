using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/admin/products")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProductsForAdmin()
        {
            var products = await _context.Products
                .OrderByDescending(p => p.Id)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Brand = p.Brand,
                    Category = p.Category,
                    AllergenKey = p.AllergenKey,
                    IsSafe = p.IsSafe,
                    IsHidden = p.IsHidden,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct(CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = new Product
            {
                Name = dto.Name,
                Brand = dto.Brand,
                Category = dto.Category,
                AllergenKey = dto.AllergenKey,
                IsSafe = dto.IsSafe,
                IsHidden = false,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            return Ok(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Brand = product.Brand,
                Category = product.Category,
                AllergenKey = product.AllergenKey,
                IsSafe = product.IsSafe,
                IsHidden = product.IsHidden,
                Description = product.Description,
                ImageUrl = product.ImageUrl
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.Name = dto.Name;
            product.Brand = dto.Brand;
            product.Category = dto.Category;
            product.AllergenKey = dto.AllergenKey;
            product.IsSafe = dto.IsSafe;
            product.IsHidden = dto.IsHidden;
            product.Description = dto.Description;
            product.ImageUrl = dto.ImageUrl;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Brand = product.Brand,
                Category = product.Category,
                AllergenKey = product.AllergenKey,
                IsSafe = product.IsSafe,
                IsHidden = product.IsHidden,
                Description = product.Description,
                ImageUrl = product.ImageUrl
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product deleted successfully."
            });
        }

        [HttpPatch("{id}/toggle-hide")]
        public async Task<IActionResult> ToggleHideProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.IsHidden = !product.IsHidden;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = product.IsHidden ? "Product hidden successfully." : "Product shown successfully.",
                isHidden = product.IsHidden
            });
        }

        [HttpPatch("{id}/hide")]
        public async Task<IActionResult> HideProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.IsHidden = true;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product hidden successfully."
            });
        }

        [HttpPatch("{id}/show")]
        public async Task<IActionResult> ShowProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.IsHidden = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product shown successfully."
            });
        }
    }
}