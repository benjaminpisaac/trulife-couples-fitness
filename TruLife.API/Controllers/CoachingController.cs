using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TruLife.API.Data;
using TruLife.API.DTOs;
using TruLife.API.Models;
using TruLife.API.Services;

namespace TruLife.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CoachingController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        private readonly ILogger<CoachingController> _logger;
        
        public CoachingController(
            TruLifeDbContext context,
            AuthService authService,
            GeminiService geminiService,
            ILogger<CoachingController> logger)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
            _logger = logger;
        }
        
        [HttpPost("message")]
        public async Task<ActionResult<CoachingMessageResponse>> SendMessage(CoachingMessageRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Coaching message from user {userId}, coach: {request.CoachType}");
            
            try
            {
                // Get or create coaching session
                var session = await _context.CoachingSessions
                    .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.CoachType == request.CoachType);
                
                if (session == null)
                {
                    session = new CoachingSession
                    {
                        UserId = userId.Value,
                        CoachType = request.CoachType,
                        ConversationHistory = "[]",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CoachingSessions.Add(session);
                }
                
                // Get conversation history
                var history = string.IsNullOrEmpty(session.ConversationHistory)
                    ? new List<Dictionary<string, string>>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, string>>>(session.ConversationHistory)
                      ?? new List<Dictionary<string, string>>();
                
                // Add user message to history
                history.Add(new Dictionary<string, string>
                {
                    { "role", "user" },
                    { "content", request.Message },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                });
                
                // Get user context
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                // Get AI response
                string aiResponse;
                if (request.CoachType == "PersonalTrainer")
                {
                    aiResponse = await _geminiService.GetPersonalTrainerResponse(
                        request.Message,
                        history,
                        user?.Profile
                    );
                }
                else if (request.CoachType == "MindsetCoach")
                {
                    aiResponse = await _geminiService.GetMindsetCoachResponse(
                        request.Message,
                        history,
                        user?.Profile
                    );
                }
                else
                {
                    return BadRequest("Invalid coach type");
                }
                
                // Add AI response to history
                history.Add(new Dictionary<string, string>
                {
                    { "role", "assistant" },
                    { "content", aiResponse },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                });
                
                // Update session
                session.ConversationHistory = System.Text.Json.JsonSerializer.Serialize(history);
                session.LastMessageAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new CoachingMessageResponse
                {
                    Response = aiResponse,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing coaching message");
                return StatusCode(500, "Error processing coaching message");
            }
        }
        
        [HttpGet("history/{coachType}")]
        public async Task<ActionResult<List<Dictionary<string, string>>>> GetHistory(string coachType)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var session = await _context.CoachingSessions
                .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.CoachType == coachType);
            
            if (session == null || string.IsNullOrEmpty(session.ConversationHistory))
            {
                return Ok(new List<Dictionary<string, string>>());
            }
            
            var history = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, string>>>(session.ConversationHistory)
                ?? new List<Dictionary<string, string>>();
            
            return Ok(history);
        }
        
        [HttpDelete("history/{coachType}")]
        public async Task<ActionResult> ClearHistory(string coachType)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var session = await _context.CoachingSessions
                .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.CoachType == coachType);
            
            if (session != null)
            {
                _context.CoachingSessions.Remove(session);
                await _context.SaveChangesAsync();
            }
            
            return Ok();
        }
    }
}
