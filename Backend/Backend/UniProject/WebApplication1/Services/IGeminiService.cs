namespace WebApplication1.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateReplyAsync(string message, string userAllergiesContext);
    }
}