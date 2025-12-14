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
    public class EquipmentController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        private readonly ILogger<EquipmentController> _logger;
        
        public EquipmentController(
            TruLifeDbContext context, 
            AuthService authService, 
            GeminiService geminiService,
            ILogger<EquipmentController> logger)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
            _logger = logger;
        }
        
        [HttpPost("analyze")]
        public async Task<ActionResult<EquipmentAnalysisResponse>> AnalyzeEquipment(AnalyzeEquipmentRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Analyzing equipment photo for user {userId}");
            
            try
            {
                // Use Gemini Vision to detect equipment
                var analysis = await _geminiService.AnalyzeEquipmentPhoto(request.Base64Image);
                
                return Ok(new EquipmentAnalysisResponse
                {
                    DetectedEquipment = analysis.DetectedEquipment,
                    SpaceAssessment = analysis.SpaceAssessment,
                    Notes = analysis.Notes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing equipment photo");
                return StatusCode(500, "Error analyzing equipment photo");
            }
        }
        
        [HttpGet("presets")]
        public async Task<ActionResult<List<EquipmentPresetDto>>> GetPresets()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var presets = await _context.EquipmentPresets
                .Where(ep => ep.UserId == userId)
                .OrderByDescending(ep => ep.IsFavorite)
                .ThenByDescending(ep => ep.CreatedAt)
                .ToListAsync();
            
            return Ok(presets.Select(p => new EquipmentPresetDto
            {
                Id = p.Id,
                Name = p.Name,
                PhotoUrl = p.PhotoUrl,
                AvailableEquipment = string.IsNullOrEmpty(p.AvailableEquipment) 
                    ? new List<string>() 
                    : System.Text.Json.JsonSerializer.Deserialize<List<string>>(p.AvailableEquipment) ?? new List<string>(),
                IsFavorite = p.IsFavorite,
                CreatedAt = p.CreatedAt
            }).ToList());
        }
        
        [HttpPost("presets")]
        public async Task<ActionResult<EquipmentPresetDto>> CreatePreset(CreateEquipmentPresetRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Creating equipment preset for user {userId}");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // If image provided, analyze it first
                List<string> equipment = request.AvailableEquipment ?? new List<string>();
                string? photoUrl = null;
                
                if (!string.IsNullOrEmpty(request.Base64Image))
                {
                    var analysis = await _geminiService.AnalyzeEquipmentPhoto(request.Base64Image);
                    equipment = analysis.DetectedEquipment;
                    
                    // Save photo (in production, upload to blob storage)
                    photoUrl = $"/uploads/equipment/{Guid.NewGuid()}.jpg";
                }
                
                var preset = new EquipmentPreset
                {
                    UserId = userId.Value,
                    Name = request.Name,
                    PhotoUrl = photoUrl,
                    AvailableEquipment = System.Text.Json.JsonSerializer.Serialize(equipment),
                    IsFavorite = false,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.EquipmentPresets.Add(preset);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Created equipment preset {preset.Id} for user {userId}");
                
                return Ok(new EquipmentPresetDto
                {
                    Id = preset.Id,
                    Name = preset.Name,
                    PhotoUrl = preset.PhotoUrl,
                    AvailableEquipment = equipment,
                    IsFavorite = preset.IsFavorite,
                    CreatedAt = preset.CreatedAt
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating equipment preset");
                return StatusCode(500, "Error creating equipment preset");
            }
        }
        
        [HttpPut("presets/{id}/favorite")]
        public async Task<ActionResult> ToggleFavorite(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var preset = await _context.EquipmentPresets
                .FirstOrDefaultAsync(ep => ep.Id == id && ep.UserId == userId);
            
            if (preset == null) return NotFound();
            
            preset.IsFavorite = !preset.IsFavorite;
            await _context.SaveChangesAsync();
            
            return Ok();
        }
        
        [HttpDelete("presets/{id}")]
        public async Task<ActionResult> DeletePreset(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var preset = await _context.EquipmentPresets
                .FirstOrDefaultAsync(ep => ep.Id == id && ep.UserId == userId);
            
            if (preset == null) return NotFound();
            
            _context.EquipmentPresets.Remove(preset);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Deleted equipment preset {id} for user {userId}");
            
            return Ok();
        }
    }
}
