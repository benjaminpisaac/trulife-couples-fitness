using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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
    public class GeneticsController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly GeminiService _geminiService;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<GeneticsController> _logger;

        public GeneticsController(
            TruLifeDbContext context,
            GeminiService geminiService,
            IWebHostEnvironment environment,
            ILogger<GeneticsController> logger)
        {
            _context = context;
            _geminiService = geminiService;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<GeneticProfileResponse>> GetGeneticProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var profile = await _context.GeneticProfiles
                .Where(gp => gp.UserId == userId)
                .OrderByDescending(gp => gp.UploadDate)
                .FirstOrDefaultAsync();

            if (profile == null)
            {
                return NotFound(new { message = "No genetic profile found" });
            }

            return Ok(MapToResponse(profile));
        }

        [HttpPost("upload")]
        public async Task<ActionResult<GeneticProfileResponse>> UploadDNA([FromForm] IFormFile file, [FromForm] string dataSource)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                _logger.LogInformation("DNA upload started for user {UserId}", userId);

                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                if (file.Length > 50 * 1024 * 1024) // 50MB limit
                {
                    return BadRequest(new { message = "File too large. Maximum 50MB." });
                }

                // Save file
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", "dna");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{file.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/dna/{fileName}";
                _logger.LogInformation("DNA file saved: {FileUrl}", fileUrl);

                // Step 1: Extract SNPs using Gemini AI
                var fileContent = await System.IO.File.ReadAllTextAsync(filePath);
                var snpData = await ExtractSNPs(fileContent);

                // Step 2: Interpret genetics using Gemini AI
                var interpretation = await InterpretGenetics(snpData);

                // Step 3: Save to database
                var geneticProfile = new GeneticProfile
                {
                    UserId = userId,
                    UploadDate = DateTime.UtcNow,
                    DataSource = dataSource,
                    FileUrl = fileUrl,
                    Actn3Rs1815739 = ConvertToStandardFormat(snpData.Rs1815739, "ACTN3"),
                    AceRs4340 = ConvertToStandardFormat(snpData.Rs4340, "ACE"),
                    PparaRs4253778 = snpData.Rs4253778,
                    FtoRs9939609 = snpData.Rs9939609,
                    VdrRs2228570 = ConvertToStandardFormat(snpData.Rs2228570, "VDR"),
                    Cyp1a2Rs762551 = snpData.Rs762551,
                    MthfrRs1801133 = snpData.Rs1801133,
                    Col5a1Rs12722 = snpData.Rs12722,
                    Mct1Rs1049434 = snpData.Rs1049434,
                    TrainingRecommendation = interpretation.TrainingRecommendation,
                    NutritionRecommendation = interpretation.NutritionRecommendation,
                    SupplementRecommendations = JsonSerializer.Serialize(interpretation.SupplementRecommendations),
                    InjuryRiskFactors = JsonSerializer.Serialize(interpretation.InjuryRiskFactors),
                    AnalysisSummary = interpretation.AnalysisSummary,
                    CreatedAt = DateTime.UtcNow
                };

                _context.GeneticProfiles.Add(geneticProfile);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Genetic profile created successfully for user {UserId}", userId);

                return Ok(MapToResponse(geneticProfile));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing DNA upload for user {UserId}", userId);
                return StatusCode(500, new { message = "Failed to process DNA file", error = ex.Message });
            }
        }

        private async Task<SNPExtractionResult> ExtractSNPs(string fileContent)
        {
            var prompt = @"Parse this 23andMe/AncestryDNA raw data file and extract ONLY these specific SNPs:

TARGET SNPs (fitness-relevant genes):
1. rs1815739 (ACTN3) - Sprint gene
2. rs4340 (ACE) - Endurance gene  
3. rs4253778 (PPARA) - Fat metabolism
4. rs9939609 (FTO) - Obesity risk
5. rs2228570 (VDR) - Vitamin D receptor
6. rs762551 (CYP1A2) - Caffeine metabolism
7. rs1801133 (MTHFR) - Folate metabolism
8. rs12722 (COL5A1) - Injury risk
9. rs1049434 (MCT1) - Lactate clearance

For each SNP found, extract the genotype (e.g., ""CC"", ""CT"", ""TT"", ""AA"", ""AG"", etc.).
If SNP not found in file, mark as ""unknown"".

The file format is typically:
# comment lines
rsid    chromosome    position    genotype
rs1815739    11    66560624    CT

Return JSON with: { ""rs1815739"": ""CT"", ""rs4340"": ""DD"", ... }

FILE CONTENT (first 10000 characters):
" + fileContent.Substring(0, Math.Min(10000, fileContent.Length));

            try
            {
                var result = await _geminiService.GenerateContentAsync<SNPExtractionResult>(prompt);
                return result ?? new SNPExtractionResult();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting SNPs from DNA file");
                return new SNPExtractionResult();
            }
        }

        private async Task<GeneticInterpretationResult> InterpretGenetics(SNPExtractionResult snpData)
        {
            var prompt = $@"You are a genetic counselor specializing in sports genetics. Interpret these fitness-relevant SNPs:

GENETIC DATA:
- ACTN3 rs1815739: {snpData.Rs1815739 ?? "unknown"} (Sprint gene)
- ACE rs4340: {snpData.Rs4340 ?? "unknown"} (Endurance)
- PPARA rs4253778: {snpData.Rs4253778 ?? "unknown"} (Fat metabolism)
- FTO rs9939609: {snpData.Rs9939609 ?? "unknown"} (Obesity risk)
- VDR rs2228570: {snpData.Rs2228570 ?? "unknown"} (Vitamin D)
- CYP1A2 rs762551: {snpData.Rs762551 ?? "unknown"} (Caffeine)
- MTHFR rs1801133: {snpData.Rs1801133 ?? "unknown"} (Folate)
- COL5A1 rs12722: {snpData.Rs12722 ?? "unknown"} (Injury risk)
- MCT1 rs1049434: {snpData.Rs1049434 ?? "unknown"} (Lactate)

INTERPRETATION GUIDE:
ACTN3: RR/CC = Power athlete, RX/CT = Balanced, XX/TT = Endurance
ACE: DD = Power, ID = Balanced, II = Endurance  
PPARA: GG = Efficient fat oxidation, CC = Less efficient
FTO: TT = Lower obesity risk, AA = Higher risk (need calorie control)
VDR: FF = Good vitamin D response, ff = Need higher doses
CYP1A2: AA = Fast caffeine metabolizer, CC = Slow (limit caffeine)
MTHFR: CC = Normal, TT = Need methylfolate supplement
COL5A1: CC = Lower injury risk, TT = Higher tendon/ligament risk
MCT1: TT = Better lactate clearance (good for HIIT)

Provide:
1. training_recommendation: ""Power-biased"" or ""Endurance-biased"" or ""Balanced hybrid""
2. nutrition_recommendation: Suggested macro split and why
3. supplement_recommendations: Array of supplements needed based on genetics
4. injury_risk_factors: Array of injury risks to watch for
5. analysis_summary: 2-3 paragraph summary of their genetic fitness profile

Be specific and actionable. Reference the science but keep it understandable.";

            try
            {
                var result = await _geminiService.GenerateContentAsync<GeneticInterpretationResult>(prompt);
                return result ?? new GeneticInterpretationResult
                {
                    TrainingRecommendation = "Balanced hybrid",
                    NutritionRecommendation = "Standard macros: 40% carbs, 30% protein, 30% fat",
                    SupplementRecommendations = new List<string> { "Multivitamin", "Vitamin D" },
                    InjuryRiskFactors = new List<string> { "General injury prevention recommended" },
                    AnalysisSummary = "Unable to fully analyze genetic data. Please consult with a healthcare professional."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interpreting genetics");
                return new GeneticInterpretationResult
                {
                    TrainingRecommendation = "Balanced hybrid",
                    NutritionRecommendation = "Standard macros: 40% carbs, 30% protein, 30% fat",
                    SupplementRecommendations = new List<string> { "Multivitamin" },
                    InjuryRiskFactors = new List<string> { "General injury prevention" },
                    AnalysisSummary = "Analysis error occurred. Please try again or consult a healthcare professional."
                };
            }
        }

        private string ConvertToStandardFormat(string? genotype, string gene)
        {
            if (string.IsNullOrEmpty(genotype) || genotype == "unknown" || genotype == "--")
            {
                return "unknown";
            }

            var conversions = new Dictionary<string, Dictionary<string, string>>
            {
                ["ACTN3"] = new() { ["CC"] = "RR", ["CT"] = "RX", ["TT"] = "XX", ["RR"] = "RR", ["RX"] = "RX", ["XX"] = "XX" },
                ["ACE"] = new() { ["DD"] = "DD", ["ID"] = "ID", ["II"] = "II", ["DI"] = "ID" },
                ["VDR"] = new() { ["CC"] = "FF", ["CT"] = "Ff", ["TT"] = "ff", ["FF"] = "FF", ["Ff"] = "Ff", ["ff"] = "ff" }
            };

            if (conversions.ContainsKey(gene) && conversions[gene].ContainsKey(genotype.ToUpper()))
            {
                return conversions[gene][genotype.ToUpper()];
            }

            return genotype.ToUpper();
        }

        private GeneticProfileResponse MapToResponse(GeneticProfile profile)
        {
            return new GeneticProfileResponse
            {
                Id = profile.Id,
                UploadDate = profile.UploadDate,
                DataSource = profile.DataSource,
                FileUrl = profile.FileUrl,
                Actn3Rs1815739 = profile.Actn3Rs1815739,
                AceRs4340 = profile.AceRs4340,
                PparaRs4253778 = profile.PparaRs4253778,
                FtoRs9939609 = profile.FtoRs9939609,
                VdrRs2228570 = profile.VdrRs2228570,
                Cyp1a2Rs762551 = profile.Cyp1a2Rs762551,
                MthfrRs1801133 = profile.MthfrRs1801133,
                Col5a1Rs12722 = profile.Col5a1Rs12722,
                Mct1Rs1049434 = profile.Mct1Rs1049434,
                TrainingRecommendation = profile.TrainingRecommendation,
                NutritionRecommendation = profile.NutritionRecommendation,
                SupplementRecommendations = string.IsNullOrEmpty(profile.SupplementRecommendations)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(profile.SupplementRecommendations),
                InjuryRiskFactors = string.IsNullOrEmpty(profile.InjuryRiskFactors)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(profile.InjuryRiskFactors),
                AnalysisSummary = profile.AnalysisSummary
            };
        }
    }
}
