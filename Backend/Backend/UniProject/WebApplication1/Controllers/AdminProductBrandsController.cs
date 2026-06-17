using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminProductBrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminProductBrandsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("products/{productId}/brands")]
        public async Task<IActionResult> GetBrandsByProduct(int productId)
        {
            var productExists = await _context.Products.AnyAsync(p => p.Id == productId);

            if (!productExists)
                return NotFound("Product not found.");

            var brands = await _context.ProductBrands
                .Where(b => b.ProductId == productId)
                .Include(b => b.Stores)
                .OrderByDescending(b => b.Id)
                .Select(b => new ProductBrandDto
                {
                    Id = b.Id,
                    ProductId = b.ProductId,
                    Name = b.Name,
                    IsHidden = b.IsHidden,
                    Stores = b.Stores.Select(s => new StoreDto
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Location = s.Location,
                        GoogleMapsUrl = s.GoogleMapsUrl,
                        IsHidden = s.IsHidden
                    }).ToList()
                })
                .ToListAsync();

            return Ok(brands);
        }

        [HttpPost("products/{productId}/brands")]
        public async Task<IActionResult> CreateBrand(int productId, CreateProductBrandDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var productExists = await _context.Products.AnyAsync(p => p.Id == productId);

            if (!productExists)
                return NotFound("Product not found.");

            var brand = new ProductBrand
            {
                ProductId = productId,
                Name = dto.Name,
                IsHidden = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ProductBrands.AddAsync(brand);
            await _context.SaveChangesAsync();

            return Ok(new ProductBrandDto
            {
                Id = brand.Id,
                ProductId = brand.ProductId,
                Name = brand.Name,
                IsHidden = brand.IsHidden,
                Stores = new List<StoreDto>()
            });
        }

        [HttpPut("products/{productId}/brands/{brandId}")]
        public async Task<IActionResult> UpdateBrand(int productId, int brandId, UpdateProductBrandDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var brand = await _context.ProductBrands
                .FirstOrDefaultAsync(b => b.Id == brandId && b.ProductId == productId);

            if (brand == null)
                return NotFound("Brand not found.");

            brand.Name = dto.Name;
            brand.IsHidden = dto.IsHidden;
            brand.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ProductBrandDto
            {
                Id = brand.Id,
                ProductId = brand.ProductId,
                Name = brand.Name,
                IsHidden = brand.IsHidden,
                Stores = new List<StoreDto>()
            });
        }

        [HttpDelete("products/{productId}/brands/{brandId}")]
        public async Task<IActionResult> DeleteBrand(int productId, int brandId)
        {
            var brand = await _context.ProductBrands
                .Include(b => b.Stores)
                .FirstOrDefaultAsync(b => b.Id == brandId && b.ProductId == productId);

            if (brand == null)
                return NotFound("Brand not found.");

            _context.Stores.RemoveRange(brand.Stores);
            _context.ProductBrands.Remove(brand);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Brand deleted successfully."
            });
        }

        [HttpPatch("products/{productId}/brands/{brandId}/hide")]
        public async Task<IActionResult> HideBrand(int productId, int brandId)
        {
            var brand = await _context.ProductBrands
                .FirstOrDefaultAsync(b => b.Id == brandId && b.ProductId == productId);

            if (brand == null)
                return NotFound("Brand not found.");

            brand.IsHidden = true;
            brand.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Brand hidden successfully."
            });
        }

        [HttpPatch("products/{productId}/brands/{brandId}/show")]
        public async Task<IActionResult> ShowBrand(int productId, int brandId)
        {
            var brand = await _context.ProductBrands
                .FirstOrDefaultAsync(b => b.Id == brandId && b.ProductId == productId);

            if (brand == null)
                return NotFound("Brand not found.");

            brand.IsHidden = false;
            brand.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Brand shown successfully."
            });
        }

        [HttpPost("brands/{brandId}/stores")]
        public async Task<IActionResult> CreateStore(int brandId, CreateStoreDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var brandExists = await _context.ProductBrands.AnyAsync(b => b.Id == brandId);

            if (!brandExists)
                return NotFound("Brand not found.");

            var store = new Store
            {
                ProductBrandId = brandId,
                Name = dto.Name,
                Location = dto.Location,
                GoogleMapsUrl = dto.GoogleMapsUrl,
                IsHidden = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Stores.AddAsync(store);
            await _context.SaveChangesAsync();

            return Ok(new StoreDto
            {
                Id = store.Id,
                Name = store.Name,
                Location = store.Location,
                GoogleMapsUrl = store.GoogleMapsUrl,
                IsHidden = store.IsHidden
            });
        }

        [HttpPut("brands/{brandId}/stores/{storeId}")]
        public async Task<IActionResult> UpdateStore(int brandId, int storeId, UpdateStoreDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var store = await _context.Stores
                .FirstOrDefaultAsync(s => s.Id == storeId && s.ProductBrandId == brandId);

            if (store == null)
                return NotFound("Store not found.");

            store.Name = dto.Name;
            store.Location = dto.Location;
            store.GoogleMapsUrl = dto.GoogleMapsUrl;
            store.IsHidden = dto.IsHidden;
            store.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new StoreDto
            {
                Id = store.Id,
                Name = store.Name,
                Location = store.Location,
                GoogleMapsUrl = store.GoogleMapsUrl,
                IsHidden = store.IsHidden
            });
        }

        [HttpDelete("brands/{brandId}/stores/{storeId}")]
        public async Task<IActionResult> DeleteStore(int brandId, int storeId)
        {
            var store = await _context.Stores
                .FirstOrDefaultAsync(s => s.Id == storeId && s.ProductBrandId == brandId);

            if (store == null)
                return NotFound("Store not found.");

            _context.Stores.Remove(store);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Store deleted successfully."
            });
        }

        [HttpPatch("brands/{brandId}/stores/{storeId}/hide")]
        public async Task<IActionResult> HideStore(int brandId, int storeId)
        {
            var store = await _context.Stores
                .FirstOrDefaultAsync(s => s.Id == storeId && s.ProductBrandId == brandId);

            if (store == null)
                return NotFound("Store not found.");

            store.IsHidden = true;
            store.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Store hidden successfully."
            });
        }

        [HttpPatch("brands/{brandId}/stores/{storeId}/show")]
        public async Task<IActionResult> ShowStore(int brandId, int storeId)
        {
            var store = await _context.Stores
                .FirstOrDefaultAsync(s => s.Id == storeId && s.ProductBrandId == brandId);

            if (store == null)
                return NotFound("Store not found.");

            store.IsHidden = false;
            store.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Store shown successfully."
            });
        }
    }
}