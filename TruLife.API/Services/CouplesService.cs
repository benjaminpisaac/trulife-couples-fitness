using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TruLife.API.Data;
using TruLife.API.Models;

namespace TruLife.API.Services
{
    public class CouplesService
    {
        private readonly TruLifeDbContext _context;

        private readonly GeminiService _geminiService;
        private readonly TransformationAnalysisService _transformationService;

        public CouplesService(TruLifeDbContext context, GeminiService geminiService, TransformationAnalysisService transformationService)
        {
            _context = context;
            _geminiService = geminiService;
            _transformationService = transformationService;
        }

        public async Task<CoupleProfile?> GetCoupleProfile(string userId)
        {
            var userIdInt = int.Parse(userId);
            
            var coupleProfile = await _context.CoupleProfiles
                .Include(cp => cp.PartnerA)
                .Include(cp => cp.PartnerB)
                .FirstOrDefaultAsync(cp => 
                    (cp.PartnerAId == userIdInt || cp.PartnerBId == userIdInt) && cp.IsActive);

            return coupleProfile;
        }

        public async Task<CoupleProfile> CreatePairing(string userId, string partnerEmail)
        {
            var userIdInt = int.Parse(userId);
            
            // Find partner by email
            var partner = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == partnerEmail);

            if (partner == null)
            {
                throw new Exception("Partner not found with that email");
            }

            if (partner.Id == userIdInt)
            {
                throw new Exception("Cannot pair with yourself");
            }

            // Check if already paired
            var existingPairing = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userIdInt && cp.PartnerBId == partner.Id) ||
                    (cp.PartnerAId == partner.Id && cp.PartnerBId == userIdInt));

            if (existingPairing != null)
            {
                throw new Exception("Already paired with this user");
            }

            // Create couple profile
            var coupleProfile = new CoupleProfile
            {
                PartnerAId = userIdInt,
                PartnerBId = partner.Id,
                PairedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.CoupleProfiles.Add(coupleProfile);
            await _context.SaveChangesAsync();

            return coupleProfile;
        }

        public async Task<List<CoupleChallenge>> GetChallenges(string userId)
        {
            var userIdInt = int.Parse(userId);
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userIdInt || cp.PartnerBId == userIdInt) && cp.IsActive);

            if (coupleProfile == null)
            {
                return new List<CoupleChallenge>();
            }

            var challenges = await _context.CoupleChallenges
                .Where(c => c.CoupleProfileId == coupleProfile.Id && c.IsActive)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();

            return challenges;
        }

        public async Task<object> GenerateRomanticEvening(string userId)
        {
            var userIdInt = int.Parse(userId);
            var coupleProfile = await GetCoupleProfile(userId);
            
            if (coupleProfile == null)
            {
                throw new Exception("Couple profile not found");
            }

            // Get preferences from polls
            var polls = await _context.RomanticAttractionPolls
                .Where(p => p.CoupleProfileId == coupleProfile.Id)
                .ToListAsync();

            var partnerAPoll = polls.FirstOrDefault(p => p.RespondentId == coupleProfile.PartnerAId);
            var partnerBPoll = polls.FirstOrDefault(p => p.RespondentId == coupleProfile.PartnerBId);

            // Get macro targets
            var partnerAMacros = await _context.MacroTargets
                .FirstOrDefaultAsync(m => m.UserId == coupleProfile.PartnerAId);
            var partnerBMacros = await _context.MacroTargets
                .FirstOrDefaultAsync(m => m.UserId == coupleProfile.PartnerBId);

            var aPrefs = partnerAPoll?.AdditionalPreferences ?? "No specific preferences";
            var bPrefs = partnerBPoll?.AdditionalPreferences ?? "No specific preferences";
            
            var aMacros = partnerAMacros != null 
                ? $"Cals: {partnerAMacros.DailyCalories}, P: {partnerAMacros.ProteinGrams}g, C: {partnerAMacros.CarbsGrams}g, F: {partnerAMacros.FatsGrams}g"
                : "Standard 2000 cal";
            
            var bMacros = partnerBMacros != null 
                ? $"Cals: {partnerBMacros.DailyCalories}, P: {partnerBMacros.ProteinGrams}g, C: {partnerBMacros.CarbsGrams}g, F: {partnerBMacros.FatsGrams}g"
                : "Standard 2000 cal";

            var eveningJson = await _geminiService.GenerateRomanticEvening(
                aPrefs, bPrefs, aMacros, bMacros
            );

            // Save the generated evening
            var eveningData = JsonSerializer.Deserialize<JsonElement>(eveningJson);
            
            var evening = new RomanticEvening
            {
                CoupleProfileId = coupleProfile.Id,
                OverallTheme = eveningData.GetProperty("theme").GetString(),
                Ambience = eveningData.GetProperty("ambience").GetString(),
                PartnerAMealName = eveningData.GetProperty("partnerAMeal").GetProperty("name").GetString(),
                PartnerAMealRecipe = eveningData.GetProperty("partnerAMeal").GetProperty("recipe").ToString(),
                PartnerAMealMacros = eveningData.GetProperty("partnerAMeal").GetProperty("macros").ToString(),
                PartnerBMealName = eveningData.GetProperty("partnerBMeal").GetProperty("name").GetString(),
                PartnerBMealRecipe = eveningData.GetProperty("partnerBMeal").GetProperty("recipe").ToString(),
                PartnerBMealMacros = eveningData.GetProperty("partnerBMeal").GetProperty("macros").ToString(),
                GeneratedAt = DateTime.UtcNow
            };

            _context.RomanticEvenings.Add(evening);
            await _context.SaveChangesAsync();

            return evening;
        }
    }
}
