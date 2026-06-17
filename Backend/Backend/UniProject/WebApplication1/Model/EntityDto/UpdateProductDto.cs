using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class UpdateProductDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Brand { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(100)]
        public string AllergenKey { get; set; } = string.Empty;

        public bool IsSafe { get; set; } = true;

        public bool IsHidden { get; set; } = false;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }
}