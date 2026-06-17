namespace WebApplication1.Model.EntityDto
{
    public class UserProfileDto
    {
        public int Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public List<UserAllergyDto> Allergies { get; set; } = new();
        public bool OnboardingComplete { get; set; }
    }
}