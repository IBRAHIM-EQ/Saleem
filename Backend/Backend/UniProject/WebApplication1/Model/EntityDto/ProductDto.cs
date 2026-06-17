namespace WebApplication1.Model.EntityDto
{
    public class ProductDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Brand { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string AllergenKey { get; set; } = string.Empty;

        public bool IsSafe { get; set; }

        public bool IsHidden { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }
        public List<ProductBrandDto> ProductBrands { get; set; } = new();
    }
}