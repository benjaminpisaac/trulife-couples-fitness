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
    public class RecoveryController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly ILogger<RecoveryController> _logger;
        
        public RecoveryController(
            TruLifeDbContext context,
            AuthService authService,
            ILogger<RecoveryController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }
        
        [HttpPost]
        public async Task<ActionResult<RecoveryLogDto>> CreateRecoveryLog(CreateRecoveryLogRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Calculate recovery score (average of all metrics)
                var recoveryScore = (request.SleepQuality + request.StressLevel + request.MuscleRecovery) / 3;
                
                var log = new RecoveryLog
                {
                    UserId = userId.Value,
                    LogDate = DateTime.UtcNow,
                    RecoveryScore = recoveryScore,
                    SleepQuality = request.SleepQuality,
                    HoursSlept = request.HoursSlept,
                    StressLevel = request.StressLevel,
                    MuscleRecovery = request.MuscleRecovery,
                    Notes = request.Notes
                };
                
                _context.RecoveryLogs.Add(log);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Created recovery log {log.Id} for user {userId}");
                
                return Ok(new RecoveryLogDto
                {
                    Id = log.Id,
                    LogDate = log.LogDate,
                    RecoveryScore = log.RecoveryScore,
                    SleepQuality = log.SleepQuality,
                    HoursSlept = log.HoursSlept,
                    StressLevel = log.StressLevel,
                    MuscleRecovery = log.MuscleRecovery,
                    Notes = log.Notes
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating recovery log");
                return StatusCode(500, "Error creating recovery log");
            }
        }
        
        [HttpGet("latest")]
        public async Task<ActionResult<RecoveryLogDto>> GetLatest()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var log = await _context.RecoveryLogs
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.LogDate)
                .FirstOrDefaultAsync();
            
            if (log == null) return NotFound();
            
            return Ok(new RecoveryLogDto
            {
                Id = log.Id,
                LogDate = log.LogDate,
                RecoveryScore = log.RecoveryScore,
                SleepQuality = log.SleepQuality,
                HoursSlept = log.HoursSlept,
                StressLevel = log.StressLevel,
                MuscleRecovery = log.MuscleRecovery,
                Notes = log.Notes
            });
        }
        
        [HttpGet("history")]
        public async Task<ActionResult<List<RecoveryLogDto>>> GetHistory(int days = 30)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var startDate = DateTime.UtcNow.AddDays(-days);
            
            var logs = await _context.RecoveryLogs
                .Where(r => r.UserId == userId && r.LogDate >= startDate)
                .OrderByDescending(r => r.LogDate)
                .ToListAsync();
            
            return Ok(logs.Select(l => new RecoveryLogDto
            {
                Id = l.Id,
                LogDate = l.LogDate,
                RecoveryScore = l.RecoveryScore,
                SleepQuality = l.SleepQuality,
                HoursSlept = l.HoursSlept,
                StressLevel = l.StressLevel,
                MuscleRecovery = l.MuscleRecovery,
                Notes = l.Notes
            }).ToList());
        }
    }
}
