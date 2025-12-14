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
    public class HydrationController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly ILogger<HydrationController> _logger;
        
        public HydrationController(
            TruLifeDbContext context,
            AuthService authService,
            ILogger<HydrationController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }
        
        [HttpPost("log")]
        public async Task<ActionResult<HydrationLogDto>> LogHydration(LogHydrationRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var log = new HydrationLog
                {
                    UserId = userId.Value,
                    LogDate = DateTime.UtcNow,
                    AmountMl = request.AmountMl
                };
                
                _context.HydrationLogs.Add(log);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Logged {request.AmountMl}ml hydration for user {userId}");
                
                return Ok(new HydrationLogDto
                {
                    Id = log.Id,
                    LogDate = log.LogDate,
                    AmountMl = log.AmountMl
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error logging hydration");
                return StatusCode(500, "Error logging hydration");
            }
        }
        
        [HttpGet("today")]
        public async Task<ActionResult<int>> GetTodayTotal()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            
            var total = await _context.HydrationLogs
                .Where(h => h.UserId == userId && h.LogDate >= today && h.LogDate < tomorrow)
                .SumAsync(h => h.AmountMl);
            
            return Ok(total);
        }
        
        [HttpGet("history")]
        public async Task<ActionResult<List<HydrationLogDto>>> GetHistory(int days = 7)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var startDate = DateTime.UtcNow.AddDays(-days);
            
            var logs = await _context.HydrationLogs
                .Where(h => h.UserId == userId && h.LogDate >= startDate)
                .OrderByDescending(h => h.LogDate)
                .ToListAsync();
            
            return Ok(logs.Select(l => new HydrationLogDto
            {
                Id = l.Id,
                LogDate = l.LogDate,
                AmountMl = l.AmountMl
            }).ToList());
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLog(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var log = await _context.HydrationLogs
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            
            if (log == null) return NotFound();
            
            _context.HydrationLogs.Remove(log);
            await _context.SaveChangesAsync();
            
            return Ok();
        }
    }
}
