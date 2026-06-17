using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model.EntityDto
{
    public class ChatRequestDto
    {
        [Required]
        public string Message { get; set; } = string.Empty;
    }
}
