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
    public class CouplesController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        
        public CouplesController(TruLifeDbContext context, AuthService authService, GeminiService geminiService)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
        }
        
        [HttpPost("pair")]
        public async Task<ActionResult<CoupleProfileDto>> CreatePairing(CreateCouplePairingRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            // Find partner by email
            var partner = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.PartnerEmail);
            
            if (partner == null)
            {
                return NotFound(new { message = "Partner not found with that email" });
            }
            
            if (partner.Id == userId)
            {
                return BadRequest(new { message = "Cannot pair with yourself" });
            }
            
            // Check if already paired
            var existingPairing = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId && cp.PartnerBId == partner.Id) ||
                    (cp.PartnerAId == partner.Id && cp.PartnerBId == userId));
            
            if (existingPairing != null)
            {
                return BadRequest(new { message = "Already paired with this user" });
            }
            
            // Create couple profile
            var currentUser = await _context.Users.FindAsync(userId);
            
            var coupleProfile = new CoupleProfile
            {
                PartnerAId = userId.Value,
                PartnerBId = partner.Id,
                PairedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.CoupleProfiles.Add(coupleProfile);
            await _context.SaveChangesAsync();
            
            // Update user profiles
            var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            var partnerProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == partner.Id);
            
            if (userProfile != null) userProfile.CoupleProfileId = coupleProfile.Id;
            if (partnerProfile != null) partnerProfile.CoupleProfileId = coupleProfile.Id;
            
            await _context.SaveChangesAsync();
            
            return Ok(new CoupleProfileDto
            {
                Id = coupleProfile.Id,
                PartnerAId = userId.Value,
                PartnerAName = $"{currentUser!.FirstName} {currentUser.LastName}",
                PartnerBId = partner.Id,
                PartnerBName = $"{partner.FirstName} {partner.LastName}",
                PairedAt = coupleProfile.PairedAt,
                CoupleName = coupleProfile.CoupleName
            });
        }
        
        [HttpGet("profile")]
        public async Task<ActionResult<CoupleProfileDto>> GetCoupleProfile()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId || cp.PartnerBId == userId) && cp.IsActive);
            
            if (coupleProfile == null)
            {
                return NotFound(new { message = "No active couple profile found" });
            }
            
            var partnerA = await _context.Users.FindAsync(coupleProfile.PartnerAId);
            var partnerB = await _context.Users.FindAsync(coupleProfile.PartnerBId);
            
            return Ok(new CoupleProfileDto
            {
                Id = coupleProfile.Id,
                PartnerAId = coupleProfile.PartnerAId,
                PartnerAName = $"{partnerA!.FirstName} {partnerA.LastName}",
                PartnerBId = coupleProfile.PartnerBId,
                PartnerBName = $"{partnerB!.FirstName} {partnerB.LastName}",
                PairedAt = coupleProfile.PairedAt,
                CoupleName = coupleProfile.CoupleName
            });
        }
        
        [HttpPost("challenges")]
        public async Task<ActionResult> CreateChallenge(CreateChallengeRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId || cp.PartnerBId == userId) && cp.IsActive);
            
            if (coupleProfile == null)
            {
                return NotFound(new { message = "No active couple profile found" });
            }
            
            var challenge = new CoupleChallenge
            {
                CoupleProfileId = coupleProfile.Id,
                Name = request.Name,
                Description = request.Description,
                ChallengeType = request.ChallengeType,
                Metric = request.Metric,
                PartnerATarget = request.PartnerATarget,
                PartnerBTarget = request.PartnerBTarget,
                RewardDescription = request.RewardDescription,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = true
            };
            
            _context.CoupleChallenges.Add(challenge);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Challenge created!", challengeId = challenge.Id });
        }
        
        [HttpGet("challenges")]
        public async Task<ActionResult> GetChallenges()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId || cp.PartnerBId == userId) && cp.IsActive);
            
            if (coupleProfile == null)
            {
                return NotFound(new { message = "No active couple profile found" });
            }
            
            var challenges = await _context.CoupleChallenges
                .Where(c => c.CoupleProfileId == coupleProfile.Id && c.IsActive)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();
            
            return Ok(challenges);
        }
        
        [HttpPost("romantic-evening")]
        public async Task<ActionResult> GenerateRomanticEvening(GenerateRomanticEveningRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId || cp.PartnerBId == userId) && cp.IsActive);
            
            if (coupleProfile == null)
            {
                return NotFound(new { message = "No active couple profile found" });
            }
            
            try
            {
                // Get macro targets for both partners
                var partnerAMacros = await _context.MacroTargets
                    .Where(m => m.UserId == coupleProfile.PartnerAId && m.IsActive)
                    .OrderByDescending(m => m.CalculatedAt)
                    .FirstOrDefaultAsync();
                
                var partnerBMacros = await _context.MacroTargets
                    .Where(m => m.UserId == coupleProfile.PartnerBId && m.IsActive)
                    .OrderByDescending(m => m.CalculatedAt)
                    .FirstOrDefaultAsync();
                
                string partnerAMacrosJson = partnerAMacros != null
                    ? JsonSerializer.Serialize(new { partnerAMacros.DailyCalories, partnerAMacros.ProteinGrams, partnerAMacros.CarbsGrams, partnerAMacros.FatsGrams })
                    : "{}";
                
                string partnerBMacrosJson = partnerBMacros != null
                    ? JsonSerializer.Serialize(new { partnerBMacros.DailyCalories, partnerBMacros.ProteinGrams, partnerBMacros.CarbsGrams, partnerBMacros.FatsGrams })
                    : "{}";
                
                // Generate romantic evening using AI
                var eveningJson = await _geminiService.GenerateRomanticEvening(
                    request.PartnerAPreferences,
                    request.PartnerBPreferences,
                    partnerAMacrosJson,
                    partnerBMacrosJson
                );
                
                // Parse and save
                var evening = JsonSerializer.Deserialize<JsonElement>(eveningJson);
                
                var romanticEvening = new RomanticEvening
                {
                    CoupleProfileId = coupleProfile.Id,
                    GeneratedAt = DateTime.UtcNow,
                    OverallTheme = evening.GetProperty("theme").GetString(),
                    Ambience = evening.GetProperty("ambience").GetString(),
                    PartnerAMealName = evening.GetProperty("partnerAMeal").GetProperty("name").GetString(),
                    PartnerAMealRecipe = evening.GetProperty("partnerAMeal").GetProperty("recipe").ToString(),
                    PartnerAMealMacros = evening.GetProperty("partnerAMeal").GetProperty("macros").ToString(),
                    PartnerBMealName = evening.GetProperty("partnerBMeal").GetProperty("name").GetString(),
                    PartnerBMealRecipe = evening.GetProperty("partnerBMeal").GetProperty("recipe").ToString(),
                    PartnerBMealMacros = evening.GetProperty("partnerBMeal").GetProperty("macros").ToString(),
                    SuggestedActivities = evening.GetProperty("suggestedActivities").ToString(),
                    MoodMusic = evening.GetProperty("moodMusic").ToString()
                };
                
                _context.RomanticEvenings.Add(romanticEvening);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Romantic evening generated!", evening = eveningJson });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to generate romantic evening", error = ex.Message });
            }
        }
        
        [HttpGet("romantic-evenings")]
        public async Task<ActionResult> GetRomanticEvenings()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userId || cp.PartnerBId == userId) && cp.IsActive);
            
            if (coupleProfile == null)
            {
                return NotFound(new { message = "No active couple profile found" });
            }
            
            var evenings = await _context.RomanticEvenings
                .Where(re => re.CoupleProfileId == coupleProfile.Id)
                .OrderByDescending(re => re.GeneratedAt)
                .ToListAsync();
            
            return Ok(evenings);
        }
    }
}
