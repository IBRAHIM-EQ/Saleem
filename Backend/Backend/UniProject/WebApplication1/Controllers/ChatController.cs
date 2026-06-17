using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;
using WebApplication1.Services;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly AppDbContext _context;

        public ChatController(IGeminiService geminiService, AppDbContext context)
        {
            _geminiService = geminiService;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(ChatRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var allergies = await _context.UserAllergies
                .Where(a => a.UserId == userId.Value)
                .Select(a => new
                {
                    a.AllergenKey,
                    a.Severity
                })
                .ToListAsync();

            string userAllergiesContext;

            if (!allergies.Any())
            {
                userAllergiesContext = "لا يوجد حساسية مسجلة لهذا المستخدم.";
            }
            else
            {
                userAllergiesContext = string.Join("\n", allergies.Select(a =>
                    $"- {a.AllergenKey} / الشدة: {a.Severity}"
                ));
            }

            var reply = await _geminiService.GenerateReplyAsync(dto.Message, userAllergiesContext);

            var chatMessage = new ChatMessage
            {
                UserId = userId.Value,
                UserMessage = dto.Message,
                BotReply = reply,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ChatMessages.AddAsync(chatMessage);
            await _context.SaveChangesAsync();

            var response = new ChatResponseDto
            {
                Reply = reply
            };

            return Ok(response);
        }


        [HttpGet("history")]
        public async Task<IActionResult> GetMyChatHistory()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized("Invalid token.");

            var history = await _context.ChatMessages
                .Where(m => m.UserId == userId.Value)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new ChatHistoryDto
                {
                    Id = m.Id,
                    UserMessage = m.UserMessage,
                    BotReply = m.BotReply,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(history);
        }


        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
                return null;

            if (!int.TryParse(userIdClaim, out int userId))
                return null;

            return userId;
        }
    }
}