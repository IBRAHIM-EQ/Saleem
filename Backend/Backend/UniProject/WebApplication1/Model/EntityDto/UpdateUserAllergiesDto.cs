using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class UpdateUserAllergiesDto
    {
        [Required]
        public List<UserAllergyDto> Allergies { get; set; } = new();
    }
}