using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
