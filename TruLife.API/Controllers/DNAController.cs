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
    public class DNAController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        private readonly ILogger<DNAController> _logger;
        
        public DNAController(
            TruLifeDbContext context,
            AuthService authService,
            GeminiService geminiService,
            ILogger<DNAController> logger)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
            _logger = logger;
        }
        
        [HttpPost("upload")]
        public async Task<ActionResult<DNAAnalysisDto>> UploadDNA(UploadDNARequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Uploading DNA data for user {userId}");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Save file
                var fileUrl = $"/uploads/dna/{Guid.NewGuid()}.txt";
                
                // Decode and parse DNA data
                var dnaData = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(request.Base64File));
                
                // Analyze with AI
                var analysisJson = await _geminiService.AnalyzeDNA(dnaData);
                var analysis = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(analysisJson);
                
                // Create DNA analysis
                var dnaAnalysis = new DNAAnalysis
                {
                    UserId = userId.Value,
                    UploadDate = DateTime.UtcNow,
                    FileUrl = fileUrl,
                    AIRecommendations = analysis.GetProperty("overallInsights").GetString()
                };
                
                _context.DNAAnalyses.Add(dnaAnalysis);
                await _context.SaveChangesAsync();
                
                // Extract SNPs
                var snps = new List<SNPInterpretation>();
                foreach (var snpJson in analysis.GetProperty("snps").EnumerateArray())
                {
                    var snp = new SNPInterpretation
                    {
                        DNAAnalysisId = dnaAnalysis.Id,
                        SNPId = snpJson.GetProperty("snpId").GetString() ?? "",
                        Gene = snpJson.GetProperty("gene").GetString() ?? "",
                        Genotype = snpJson.GetProperty("genotype").GetString() ?? "",
                        Interpretation = snpJson.GetProperty("healthTrait").GetString(),
                        Recommendations = snpJson.GetProperty("recommendation").GetString()
                    };
                    snps.Add(snp);
                    _context.SNPInterpretations.Add(snp);
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Created DNA analysis {dnaAnalysis.Id} with {snps.Count} SNPs");
                
                return Ok(new DNAAnalysisDto
                {
                    Id = dnaAnalysis.Id,
                    UploadDate = dnaAnalysis.UploadDate,
                    FileUrl = dnaAnalysis.FileUrl,
                    SNPs = snps.Select(s => new SNPInterpretationDto
                    {
                        Id = s.Id,
                        SNPId = s.SNPId,
                        Gene = s.Gene,
                        Genotype = s.Genotype,
                        Interpretation = s.Interpretation,
                        Recommendations = s.Recommendations
                    }).ToList(),
                    AIRecommendations = dnaAnalysis.AIRecommendations
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error uploading DNA data");
                return StatusCode(500, "Error uploading DNA data");
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<List<DNAAnalysisDto>>> GetDNAAnalyses()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var analyses = await _context.DNAAnalyses
                .Include(d => d.SNPInterpretations)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();
            
            return Ok(analyses.Select(a => new DNAAnalysisDto
            {
                Id = a.Id,
                UploadDate = a.UploadDate,
                FileUrl = a.FileUrl,
                SNPs = a.SNPInterpretations.Select(s => new SNPInterpretationDto
                {
                    Id = s.Id,
                    SNPId = s.SNPId,
                    Gene = s.Gene,
                    Genotype = s.Genotype,
                    Interpretation = s.Interpretation,
                    Recommendations = s.Recommendations
                }).ToList(),
                AIRecommendations = a.AIRecommendations
            }).ToList());
        }
    }
}
