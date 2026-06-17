using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class SpecialistDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Bio { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string WhatsAppNumber { get; set; } = string.Empty;

        public int ExperienceYears { get; set; }

        public double Rating { get; set; }

        public int ReviewsCount { get; set; }

        public bool IsHidden { get; set; }

        public string? ImageUrl { get; set; }
    }

    public class CreateSpecialistDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Bio { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(50)]
        public string WhatsAppNumber { get; set; } = string.Empty;

        public int ExperienceYears { get; set; }

        public double Rating { get; set; } = 0;

        public int ReviewsCount { get; set; } = 0;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }

    public class UpdateSpecialistDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Bio { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(50)]
        public string WhatsAppNumber { get; set; } = string.Empty;

        public int ExperienceYears { get; set; }

        public double Rating { get; set; } = 0;

        public int ReviewsCount { get; set; } = 0;

        public bool IsHidden { get; set; } = false;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }
}