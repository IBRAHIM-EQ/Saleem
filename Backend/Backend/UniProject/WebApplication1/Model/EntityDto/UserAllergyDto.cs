using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class UserAllergyDto
    {
        [Required]
        public string AllergenKey { get; set; } = string.Empty;

        [Required]
        public string Severity { get; set; } = string.Empty;
    }
}