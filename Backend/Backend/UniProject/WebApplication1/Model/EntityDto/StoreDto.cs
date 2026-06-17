using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class StoreDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string GoogleMapsUrl { get; set; } = string.Empty;

        public bool IsHidden { get; set; }
    }

    public class CreateStoreDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string GoogleMapsUrl { get; set; } = string.Empty;
    }

    public class UpdateStoreDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string GoogleMapsUrl { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = false;
    }
}