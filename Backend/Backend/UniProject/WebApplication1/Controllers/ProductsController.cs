using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products/ping — test endpoint
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new { message = "Pong", isAnonymous = true });
        }

        // GET: api/products — publicly accessible for guest browsing
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Where(p => !p.IsHidden)
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Where(p => p.Id == id && !p.IsHidden)
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound("Product not found.");

            return Ok(product);
        }

        // GET: api/products/safe-for-me
        [HttpGet("safe-for-me")]
        public async Task<IActionResult> GetSafeProductsForMe()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var userAllergens = await _context.UserAllergies
                .Where(a => a.UserId == userId.Value)
                .Select(a => a.AllergenKey)
                .ToListAsync();

            var products = await _context.Products
                .Where(p => !p.IsHidden)
                .Where(p =>
                    string.IsNullOrWhiteSpace(p.AllergenKey) ||
                    !userAllergens.Contains(p.AllergenKey)
                )
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/search?query=milk
        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query is required.");

            var products = await _context.Products
                .Where(p => !p.IsHidden)
                .Where(p =>
                    p.Name.Contains(query) ||
                    p.Brand.Contains(query) ||
                    p.Category.Contains(query) ||
                    p.AllergenKey.Contains(query)
                )
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/safe-search?query=milk
        [HttpGet("safe-search")]
        public async Task<IActionResult> SafeSearchProducts([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query is required.");

            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var userAllergens = await _context.UserAllergies
                .Where(a => a.UserId == userId.Value)
                .Select(a => a.AllergenKey)
                .ToListAsync();

            var products = await _context.Products
                .Where(p => !p.IsHidden)
                .Where(p =>
                    string.IsNullOrWhiteSpace(p.AllergenKey) ||
                    !userAllergens.Contains(p.AllergenKey)
                )
                .Where(p =>
                    p.Name.Contains(query) ||
                    p.Brand.Contains(query) ||
                    p.Category.Contains(query) ||
                    p.AllergenKey.Contains(query)
                )
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/1/alternatives
        [HttpGet("{id:int}/alternatives")]
        public async Task<IActionResult> GetProductAlternatives(int id)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsHidden);

            if (product == null)
                return NotFound("Product not found.");

            var userAllergens = await _context.UserAllergies
                .Where(a => a.UserId == userId.Value)
                .Select(a => a.AllergenKey)
                .ToListAsync();

            var alternatives = await _context.Products
                .Where(p => !p.IsHidden)
                .Where(p => p.Id != product.Id)
                .Where(p => p.Category == product.Category)
                .Where(p =>
                    string.IsNullOrWhiteSpace(p.AllergenKey) ||
                    !userAllergens.Contains(p.AllergenKey)
                )
                .Include(p => p.ProductBrands)
                    .ThenInclude(b => b.Stores)
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
                    ImageUrl = p.ImageUrl,

                    ProductBrands = p.ProductBrands
                        .Where(b => !b.IsHidden)
                        .Select(b => new ProductBrandDto
                        {
                            Id = b.Id,
                            ProductId = b.ProductId,
                            Name = b.Name,
                            IsHidden = b.IsHidden,

                            Stores = b.Stores
                                .Where(s => !s.IsHidden)
                                .Select(s => new StoreDto
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Location = s.Location,
                                    GoogleMapsUrl = s.GoogleMapsUrl,
                                    IsHidden = s.IsHidden
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(alternatives);
        }

        // GET: api/products/1/suitability
        [HttpGet("{id:int}/suitability")]
        public async Task<IActionResult> CheckProductSuitability(int id)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsHidden);

            if (product == null)
                return NotFound("Product not found.");

            var userAllergens = await _context.UserAllergies
                .Where(a => a.UserId == userId.Value)
                .Select(a => a.AllergenKey)
                .ToListAsync();

            var matchedAllergens = new List<string>();

            if (!string.IsNullOrWhiteSpace(product.AllergenKey) &&
                userAllergens.Contains(product.AllergenKey))
            {
                matchedAllergens.Add(product.AllergenKey);
            }

            var isSuitable = matchedAllergens.Count == 0;

            var reason = isSuitable
                ? "هذا المنتج مناسب لك حسب الحساسية المسجلة في حسابك."
                : $"هذا المنتج غير مناسب لك لأنه مرتبط بحساسية: {string.Join(", ", matchedAllergens)}.";

            var response = new ProductSuitabilityDto
            {
                ProductId = product.Id,
                IsSuitableForUser = isSuitable,
                Reason = reason,
                MatchedAllergens = matchedAllergens
            };

            return Ok(response);
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