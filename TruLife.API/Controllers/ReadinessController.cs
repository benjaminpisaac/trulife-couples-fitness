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
    public class ReadinessController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        
        public ReadinessController(TruLifeDbContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }
        
        [HttpPost]
        public async Task<ActionResult<ReadinessLogDto>> CreateLog(CreateReadinessLogRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var log = new ReadinessLog
            {
                UserId = userId.Value,
                SleepQuality = request.SleepQuality,
                StressLevel = request.StressLevel,
                SorenessLevel = request.SorenessLevel,
                EnergyLevel = request.EnergyLevel,
                MotivationLevel = request.MotivationLevel,
                HoursSlept = request.HoursSlept,
                Notes = request.Notes,
                LogDate = DateTime.UtcNow
            };
            
            _context.ReadinessLogs.Add(log);
            await _context.SaveChangesAsync();
            
            var readinessScore = (log.SleepQuality + log.EnergyLevel + log.MotivationLevel +
                                (10 - log.StressLevel) + (10 - log.SorenessLevel)) / 5;
            
            return Ok(new ReadinessLogDto
            {
                Id = log.Id,
                LogDate = log.LogDate,
                SleepQuality = log.SleepQuality,
                StressLevel = log.StressLevel,
                SorenessLevel = log.SorenessLevel,
                EnergyLevel = log.EnergyLevel,
                MotivationLevel = log.MotivationLevel,
                HoursSlept = log.HoursSlept,
                Notes = log.Notes,
                ReadinessScore = readinessScore
            });
        }
        
        [HttpGet("latest")]
        public async Task<ActionResult<ReadinessLogDto>> GetLatest()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            // Get today's date in UTC (start of day)
            var today = DateTime.UtcNow.Date;
            
            // Only return today's readiness log
            var log = await _context.ReadinessLogs
                .Where(r => r.UserId == userId && r.LogDate.Date == today)
                .OrderByDescending(r => r.LogDate)
                .FirstOrDefaultAsync();
            
            if (log == null)
            {
                return NotFound(new { message = "No readiness log for today" });
            }
            
            var readinessScore = (log.SleepQuality + log.EnergyLevel + log.MotivationLevel +
                                (10 - log.StressLevel) + (10 - log.SorenessLevel)) / 5;
            
            return Ok(new ReadinessLogDto
            {
                Id = log.Id,
                LogDate = log.LogDate,
                SleepQuality = log.SleepQuality,
                StressLevel = log.StressLevel,
                SorenessLevel = log.SorenessLevel,
                EnergyLevel = log.EnergyLevel,
                MotivationLevel = log.MotivationLevel,
                HoursSlept = log.HoursSlept,
                Notes = log.Notes,
                ReadinessScore = readinessScore
            });
        }
        
        [HttpGet("history")]
        public async Task<ActionResult<List<ReadinessLogDto>>> GetHistory([FromQuery] int days = 30)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            
            var logs = await _context.ReadinessLogs
                .Where(r => r.UserId == userId && r.LogDate >= cutoffDate)
                .OrderByDescending(r => r.LogDate)
                .ToListAsync();
            
            var dtos = logs.Select(log =>
            {
                var readinessScore = (log.SleepQuality + log.EnergyLevel + log.MotivationLevel +
                                    (10 - log.StressLevel) + (10 - log.SorenessLevel)) / 5;
                
                return new ReadinessLogDto
                {
                    Id = log.Id,
                    LogDate = log.LogDate,
                    SleepQuality = log.SleepQuality,
                    StressLevel = log.StressLevel,
                    SorenessLevel = log.SorenessLevel,
                    EnergyLevel = log.EnergyLevel,
                    MotivationLevel = log.MotivationLevel,
                    HoursSlept = log.HoursSlept,
                    Notes = log.Notes,
                    ReadinessScore = readinessScore
                };
            }).ToList();
            
            return Ok(dtos);
        }
    }
}
