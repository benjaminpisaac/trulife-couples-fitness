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
    public class WorkoutProgramController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        private readonly ILogger<WorkoutProgramController> _logger;
        
        public WorkoutProgramController(
            TruLifeDbContext context,
            AuthService authService,
            GeminiService geminiService,
            ILogger<WorkoutProgramController> logger)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<ActionResult<List<WorkoutProgramDto>>> GetPrograms()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var programs = await _context.WorkoutPrograms
                .Include(wp => wp.Weeks)
                .Where(wp => wp.UserId == userId)
                .OrderByDescending(wp => wp.IsActive)
                .ThenByDescending(wp => wp.StartDate)
                .ToListAsync();
            
            return Ok(programs.Select(p => new WorkoutProgramDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                DurationWeeks = p.DurationWeeks,
                StartDate = p.StartDate,
                IsActive = p.IsActive,
                Weeks = p.Weeks.Select(w => new ProgramWeekDto
                {
                    Id = w.Id,
                    WeekNumber = w.WeekNumber,
                    WorkoutPlan = w.WorkoutPlan
                }).ToList()
            }).ToList());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutProgramDto>> GetProgram(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var program = await _context.WorkoutPrograms
                .Include(wp => wp.Weeks)
                .FirstOrDefaultAsync(wp => wp.Id == id && wp.UserId == userId);
            
            if (program == null) return NotFound();
            
            return Ok(new WorkoutProgramDto
            {
                Id = program.Id,
                Name = program.Name,
                Description = program.Description,
                DurationWeeks = program.DurationWeeks,
                StartDate = program.StartDate,
                IsActive = program.IsActive,
                Weeks = program.Weeks.Select(w => new ProgramWeekDto
                {
                    Id = w.Id,
                    WeekNumber = w.WeekNumber,
                    WorkoutPlan = w.WorkoutPlan
                }).ToList()
            });
        }
        
        [HttpPost("generate")]
        public async Task<ActionResult<WorkoutProgramDto>> GenerateProgram(CreateWorkoutProgramRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Generating {request.DurationWeeks}-week program for user {userId}");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get user profile for context
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user?.Profile == null)
                {
                    return BadRequest("Profile required to generate program");
                }
                
                // Deactivate other programs
                var activePrograms = await _context.WorkoutPrograms
                    .Where(wp => wp.UserId == userId && wp.IsActive)
                    .ToListAsync();
                
                foreach (var p in activePrograms)
                {
                    p.IsActive = false;
                }
                
                // Create new program
                var program = new WorkoutProgram
                {
                    UserId = userId.Value,
                    Name = request.Name,
                    Description = request.Description,
                    DurationWeeks = request.DurationWeeks,
                    StartDate = DateTime.UtcNow,
                    IsActive = true
                };
                
                _context.WorkoutPrograms.Add(program);
                await _context.SaveChangesAsync(); // Save to get program ID
                
                // Generate weekly workouts using AI
                var weeks = new List<ProgramWeek>();
                
                for (int weekNum = 1; weekNum <= request.DurationWeeks; weekNum++)
                {
                    var weekPlan = await _geminiService.GenerateProgramWeek(
                        weekNum,
                        request.DurationWeeks,
                        request.FitnessGoal,
                        user.Profile
                    );
                    
                    var week = new ProgramWeek
                    {
                        WorkoutProgramId = program.Id,
                        WeekNumber = weekNum,
                        WorkoutPlan = weekPlan
                    };
                    
                    weeks.Add(week);
                    _context.ProgramWeeks.Add(week);
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Generated program {program.Id} with {weeks.Count} weeks");
                
                return Ok(new WorkoutProgramDto
                {
                    Id = program.Id,
                    Name = program.Name,
                    Description = program.Description,
                    DurationWeeks = program.DurationWeeks,
                    StartDate = program.StartDate,
                    IsActive = program.IsActive,
                    Weeks = weeks.Select(w => new ProgramWeekDto
                    {
                        Id = w.Id,
                        WeekNumber = w.WeekNumber,
                        WorkoutPlan = w.WorkoutPlan
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error generating workout program");
                return StatusCode(500, "Error generating workout program");
            }
        }
        
        [HttpPut("{id}/deactivate")]
        public async Task<ActionResult> DeactivateProgram(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var program = await _context.WorkoutPrograms
                .FirstOrDefaultAsync(wp => wp.Id == id && wp.UserId == userId);
            
            if (program == null) return NotFound();
            
            program.IsActive = false;
            await _context.SaveChangesAsync();
            
            return Ok();
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProgram(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var program = await _context.WorkoutPrograms
                .Include(wp => wp.Weeks)
                .FirstOrDefaultAsync(wp => wp.Id == id && wp.UserId == userId);
            
            if (program == null) return NotFound();
            
            _context.WorkoutPrograms.Remove(program);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Deleted program {id} for user {userId}");
            
            return Ok();
        }
    }
}
