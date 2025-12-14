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
    public class LabsController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        private readonly ILogger<LabsController> _logger;
        
        public LabsController(
            TruLifeDbContext context,
            AuthService authService,
            GeminiService geminiService,
            ILogger<LabsController> logger)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
            _logger = logger;
        }
        
        [HttpPost("upload")]
        public async Task<ActionResult<LabResultDto>> UploadLabResult(UploadLabResultRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Uploading lab result for user {userId}");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // In production, save PDF to blob storage
                var fileUrl = $"/uploads/labs/{Guid.NewGuid()}.pdf";
                
                // Extract text from PDF (simplified - in production use PDF parsing library)
                var labDataText = "Sample lab data"; // TODO: Extract from PDF
                
                // Analyze with AI
                var analysisJson = await _geminiService.AnalyzeLabResults(labDataText);
                var analysis = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(analysisJson);
                
                // Create lab result
                var labResult = new LabResult
                {
                    UserId = userId.Value,
                    TestDate = request.TestDate,
                    LabName = request.LabName,
                    FileUrl = fileUrl,
                    AIRecommendations = analysis.GetProperty("overallInsights").GetString()
                };
                
                _context.LabResults.Add(labResult);
                await _context.SaveChangesAsync();
                
                // Extract biomarkers
                var biomarkers = new List<Biomarker>();
                foreach (var biomarkerJson in analysis.GetProperty("biomarkers").EnumerateArray())
                {
                    var biomarker = new Biomarker
                    {
                        LabResultId = labResult.Id,
                        Name = biomarkerJson.GetProperty("name").GetString() ?? "",
                        Value = biomarkerJson.GetProperty("value").GetDouble(),
                        Unit = biomarkerJson.GetProperty("unit").GetString(),
                        ReferenceRange = $"{biomarkerJson.GetProperty("referenceRangeMin").GetDouble()}-{biomarkerJson.GetProperty("referenceRangeMax").GetDouble()}",
                        Status = biomarkerJson.GetProperty("status").GetString()
                    };
                    biomarkers.Add(biomarker);
                    _context.Biomarkers.Add(biomarker);
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Created lab result {labResult.Id} with {biomarkers.Count} biomarkers");
                
                return Ok(new LabResultDto
                {
                    Id = labResult.Id,
                    TestDate = labResult.TestDate,
                    LabName = labResult.LabName,
                    FileUrl = labResult.FileUrl,
                    Biomarkers = biomarkers.Select(b => new BiomarkerDto
                    {
                        Id = b.Id,
                        Name = b.Name,
                        Value = b.Value,
                        Unit = b.Unit,
                        ReferenceRange = b.ReferenceRange,
                        Status = b.Status
                    }).ToList(),
                    AIRecommendations = labResult.AIRecommendations
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error uploading lab result");
                return StatusCode(500, "Error uploading lab result");
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<List<LabResultDto>>> GetLabResults()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var results = await _context.LabResults
                .Include(l => l.Biomarkers)
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.TestDate)
                .ToListAsync();
            
            return Ok(results.Select(r => new LabResultDto
            {
                Id = r.Id,
                TestDate = r.TestDate,
                LabName = r.LabName,
                FileUrl = r.FileUrl,
                Biomarkers = r.Biomarkers.Select(b => new BiomarkerDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Value = b.Value,
                    Unit = b.Unit,
                    ReferenceRange = b.ReferenceRange,
                    Status = b.Status
                }).ToList(),
                AIRecommendations = r.AIRecommendations
            }).ToList());
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLabResult(int id)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var result = await _context.LabResults
                .Include(l => l.Biomarkers)
                .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
            
            if (result == null) return NotFound();
            
            _context.LabResults.Remove(result);
            await _context.SaveChangesAsync();
            
            return Ok();
        }
    }
}
