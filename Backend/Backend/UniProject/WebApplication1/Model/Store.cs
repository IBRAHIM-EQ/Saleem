using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Model
{
    public class Store
    {
        public int Id { get; set; }

        [Required]
        public int ProductBrandId { get; set; }

        [ForeignKey("ProductBrandId")]
        public ProductBrand ProductBrand { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string GoogleMapsUrl { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}