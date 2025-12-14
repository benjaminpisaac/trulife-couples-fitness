using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TruLife.API.Data;
using TruLife.API.DTOs;
using TruLife.API.Models;
using TruLife.API.Services;

namespace TruLife.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        
        public WorkoutController(TruLifeDbContext context, AuthService authService, GeminiService geminiService)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
        }
        
        [HttpPost("analyze-environment")]
        public async Task<ActionResult> AnalyzeEnvironment([FromBody] AnalyzeMealPhotoRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            try
            {
                var equipmentJson = await _geminiService.AnalyzeEquipmentFromPhoto(request.Base64Image);
                
                return Ok(new { equipment = equipmentJson });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to analyze environment", error = ex.Message });
            }
        }
        
        [HttpPost("generate")]
        public async Task<ActionResult> GenerateWorkout(GenerateWorkoutRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            try
            {
                // Get available equipment
                string availableEquipment = "Bodyweight";
                if (request.EnvironmentId.HasValue)
                {
                    var environment = await _context.Environments
                        .FirstOrDefaultAsync(e => e.Id == request.EnvironmentId && e.UserId == userId);
                    
                    if (environment != null)
                    {
                        availableEquipment = environment.AvailableEquipment ?? "Bodyweight";
                    }
                }
                
                // Get readiness score if requested
                int readinessScore = 7; // Default
                if (request.UseReadinessScore)
                {
                    var latestReadiness = await _context.ReadinessLogs
                        .Where(r => r.UserId == userId)
                        .OrderByDescending(r => r.LogDate)
                        .FirstOrDefaultAsync();
                    
                    if (latestReadiness != null)
                    {
                        readinessScore = (latestReadiness.SleepQuality + 
                                        latestReadiness.EnergyLevel + 
                                        latestReadiness.MotivationLevel +
                                        (10 - latestReadiness.StressLevel) +
                                        (10 - latestReadiness.SorenessLevel)) / 5;
                    }
                }
                
                // Get recent workout history
                var recentWorkouts = await _context.WorkoutSessions
                    .Where(w => w.UserId == userId && w.IsCompleted)
                    .OrderByDescending(w => w.CompletedAt)
                    .Take(5)
                    .Select(w => new { w.Name, w.CompletedAt })
                    .ToListAsync();
                
                string workoutHistory = JsonSerializer.Serialize(recentWorkouts);
                
                // Generate workout using AI
                var workoutJson = await _geminiService.GenerateWorkout(
                    request.FitnessGoal,
                    availableEquipment,
                    readinessScore,
                    workoutHistory
                );
                
                return Ok(new { workout = workoutJson });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to generate workout", error = ex.Message });
            }
        }
        
        [HttpGet("sessions")]
        public async Task<ActionResult<List<WorkoutSessionDto>>> GetSessions()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var sessions = await _context.WorkoutSessions
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.ScheduledDate)
                .Take(30)
                .Select(w => new WorkoutSessionDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    ScheduledDate = w.ScheduledDate,
                    IsCompleted = w.IsCompleted,
                    WorkoutData = w.WorkoutData,
                    DurationMinutes = w.DurationMinutes
                })
                .ToListAsync();
            
            return Ok(sessions);
        }
        
        [HttpPost("sessions")]
        public async Task<ActionResult<WorkoutSessionDto>> CreateSession([FromBody] WorkoutSessionDto request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var session = new WorkoutSession
            {
                UserId = userId.Value,
                Name = request.Name,
                ScheduledDate = request.ScheduledDate,
                WorkoutData = request.WorkoutData,
                IsCompleted = false
            };
            
            _context.WorkoutSessions.Add(session);
            await _context.SaveChangesAsync();
            
            return Ok(new WorkoutSessionDto
            {
                Id = session.Id,
                Name = session.Name,
                ScheduledDate = session.ScheduledDate,
                IsCompleted = session.IsCompleted,
                WorkoutData = session.WorkoutData,
                DurationMinutes = session.DurationMinutes
            });
        }
        
        [HttpPut("sessions/{id}/complete")]
        public async Task<ActionResult> CompleteSession(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var session = await _context.WorkoutSessions
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
            
            if (session == null) return NotFound();
            
            session.IsCompleted = true;
            session.CompletedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Workout completed!" });
        }
    }
}
