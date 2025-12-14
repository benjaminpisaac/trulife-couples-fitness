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
    public class NutritionController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly GeminiService _geminiService;
        
        public NutritionController(TruLifeDbContext context, AuthService authService, GeminiService geminiService)
        {
            _context = context;
            _authService = authService;
            _geminiService = geminiService;
        }
        
        [HttpPost("analyze-meal")]
        public async Task<ActionResult<MealAnalysisResponse>> AnalyzeMeal(AnalyzeMealPhotoRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            try
            {
                // Get user's dietary preferences
                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);
                
                var analysisJson = await _geminiService.AnalyzeMealFromPhoto(
                    request.Base64Image,
                    profile?.DietaryPreferences
                );
                
                var analysis = JsonSerializer.Deserialize<MealAnalysisResponse>(analysisJson);
                
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to analyze meal", error = ex.Message });
            }
        }
        
        [HttpPost("calculate-macros")]
        public async Task<ActionResult<MacroTargetDto>> CalculateMacros(CalculateMacrosRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            // Simple macro calculation logic
            double bmr = 0;
            
            // Using Mifflin-St Jeor equation (simplified without age/gender for now)
            bmr = 10 * request.CurrentWeightKg + 6.25 * 170 - 5 * 30; // Placeholder values
            
            // Activity multiplier
            double activityMultiplier = request.ActivityLevel.ToLower() switch
            {
                "sedentary" => 1.2,
                "lightly active" => 1.375,
                "moderately active" => 1.55,
                "very active" => 1.725,
                _ => 1.55
            };
            
            double tdee = bmr * activityMultiplier;
            
            // Adjust for goal
            double targetCalories = request.FitnessGoal.ToLower() switch
            {
                "weight loss" => tdee - 500,
                "muscle gain" => tdee + 300,
                _ => tdee
            };
            
            // Macro split (40/30/30 for balanced)
            double protein = (targetCalories * 0.30) / 4; // 4 cal per gram
            double carbs = (targetCalories * 0.40) / 4;
            double fats = (targetCalories * 0.30) / 9; // 9 cal per gram
            
            var macroTarget = new MacroTarget
            {
                UserId = userId.Value,
                DailyCalories = Math.Round(targetCalories),
                ProteinGrams = Math.Round(protein),
                CarbsGrams = Math.Round(carbs),
                FatsGrams = Math.Round(fats),
                IsActive = true
            };
            
            // Deactivate old targets
            var oldTargets = await _context.MacroTargets
                .Where(m => m.UserId == userId && m.IsActive)
                .ToListAsync();
            
            foreach (var old in oldTargets)
            {
                old.IsActive = false;
            }
            
            _context.MacroTargets.Add(macroTarget);
            await _context.SaveChangesAsync();
            
            return Ok(new MacroTargetDto
            {
                DailyCalories = macroTarget.DailyCalories,
                ProteinGrams = macroTarget.ProteinGrams,
                CarbsGrams = macroTarget.CarbsGrams,
                FatsGrams = macroTarget.FatsGrams
            });
        }
        
        [HttpGet("macros/current")]
        public async Task<ActionResult<MacroTargetDto>> GetCurrentMacros()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var target = await _context.MacroTargets
                .Where(m => m.UserId == userId && m.IsActive)
                .OrderByDescending(m => m.CalculatedAt)
                .FirstOrDefaultAsync();
            
            if (target == null)
            {
                return NotFound(new { message = "No macro targets found. Please calculate macros first." });
            }
            
            return Ok(new MacroTargetDto
            {
                DailyCalories = target.DailyCalories,
                ProteinGrams = target.ProteinGrams,
                CarbsGrams = target.CarbsGrams,
                FatsGrams = target.FatsGrams
            });
        }
        
        [HttpPost("meals")]
        public async Task<ActionResult> LogMeal(CreateMealLogRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var meal = new MealLog
            {
                UserId = userId.Value,
                MealName = request.MealName,
                MealType = request.MealType,
                Calories = request.Calories,
                ProteinGrams = request.ProteinGrams,
                CarbsGrams = request.CarbsGrams,
                FatsGrams = request.FatsGrams,
                PhotoUrl = request.PhotoUrl,
                Notes = request.Notes,
                LogDate = DateTime.UtcNow
            };
            
            _context.MealLogs.Add(meal);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Meal logged successfully", mealId = meal.Id });
        }
        
        [HttpGet("meals/today")]
        public async Task<ActionResult> GetTodaysMeals()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            
            var meals = await _context.MealLogs
                .Where(m => m.UserId == userId && m.LogDate >= today && m.LogDate < tomorrow)
                .OrderBy(m => m.LogDate)
                .ToListAsync();
            
            var totalCalories = meals.Sum(m => m.Calories);
            var totalProtein = meals.Sum(m => m.ProteinGrams);
            var totalCarbs = meals.Sum(m => m.CarbsGrams);
            var totalFats = meals.Sum(m => m.FatsGrams);
            
            return Ok(new
            {
                meals,
                totals = new
                {
                    calories = totalCalories,
                    protein = totalProtein,
                    carbs = totalCarbs,
                    fats = totalFats
                }
            });
        }
        
        [HttpPost("recommendations")]
        public async Task<ActionResult> GetMealRecommendations()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            try
            {
                // Get current macro target
                var target = await _context.MacroTargets
                    .Where(m => m.UserId == userId && m.IsActive)
                    .OrderByDescending(m => m.CalculatedAt)
                    .FirstOrDefaultAsync();
                
                if (target == null)
                {
                    return BadRequest(new { message = "Please calculate your macros first" });
                }
                
                // Get today's meals
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                
                var todaysMeals = await _context.MealLogs
                    .Where(m => m.UserId == userId && m.LogDate >= today && m.LogDate < tomorrow)
                    .ToListAsync();
                
                var consumedCalories = todaysMeals.Sum(m => m.Calories);
                var consumedProtein = todaysMeals.Sum(m => m.ProteinGrams);
                var consumedCarbs = todaysMeals.Sum(m => m.CarbsGrams);
                var consumedFats = todaysMeals.Sum(m => m.FatsGrams);
                
                var remainingCalories = target.DailyCalories - consumedCalories;
                var remainingProtein = target.ProteinGrams - consumedProtein;
                var remainingCarbs = target.CarbsGrams - consumedCarbs;
                var remainingFats = target.FatsGrams - consumedFats;
                
                // Get dietary preferences
                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);
                
                var recommendationsJson = await _geminiService.GenerateMealRecommendations(
                    remainingCalories,
                    remainingProtein,
                    remainingCarbs,
                    remainingFats,
                    profile?.DietaryPreferences ?? "Balanced"
                );
                
                return Ok(new { recommendations = recommendationsJson });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to generate recommendations", error = ex.Message });
            }
        }
    }
}
