namespace WebApplication1.Model.EntityDto
{
    public class ChatHistoryDto
    {
        public int Id { get; set; }

        public string UserMessage { get; set; } = string.Empty;

        public string BotReply { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}