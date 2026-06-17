using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class ProductBrandDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string Name { get; set; } = string.Empty;

        public bool IsHidden { get; set; }

        public List<StoreDto> Stores { get; set; } = new();
    }

    public class CreateProductBrandDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateProductBrandDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = false;
    }
}