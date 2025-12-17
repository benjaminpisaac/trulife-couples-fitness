using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TruLife.API.Data;
using TruLife.API.Services;

namespace TruLife.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantController : ControllerBase
    {
        private readonly GooglePlacesService _placesService;
        private readonly GeminiService _geminiService;
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;

        public RestaurantController(
            GooglePlacesService placesService,
            GeminiService geminiService,
            TruLifeDbContext context,
            AuthService authService)
        {
            _placesService = placesService;
            _geminiService = geminiService;
            _context = context;
            _authService = authService;
        }

        [HttpPost("search")]
        public async Task<ActionResult> SearchRestaurants([FromBody] RestaurantSearchRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            try
            {
                // Get user's dietary preferences and remaining macros
                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var todaysMeals = await _context.MealLogs
                    .Where(m => m.UserId == userId && m.LogDate >= today && m.LogDate < tomorrow)
                    .ToListAsync();

                var macroTarget = await _context.MacroTargets
                    .Where(m => m.UserId == userId && m.IsActive)
                    .OrderByDescending(m => m.CalculatedAt)
                    .FirstOrDefaultAsync();

                double remainingCalories = macroTarget?.DailyCalories ?? 2000;
                double remainingProtein = macroTarget?.ProteinGrams ?? 150;

                if (todaysMeals.Any())
                {
                    remainingCalories -= todaysMeals.Sum(m => m.Calories);
                    remainingProtein -= todaysMeals.Sum(m => m.ProteinGrams);
                }

                // Search nearby restaurants using Google Places
                var restaurants = await _placesService.SearchNearbyRestaurants(
                    request.Latitude,
                    request.Longitude,
                    request.RadiusMeters ?? 5000,
                    request.Cuisine
                );

                // For each restaurant, generate AI recommendations
                var results = new List<object>();
                foreach (var restaurant in restaurants.Take(10)) // Limit to top 10
                {
                    var recommendations = await _geminiService.GenerateRestaurantRecommendations(
                        remainingCalories,
                        remainingProtein,
                        profile?.DietaryPreferences ?? "Balanced",
                        request.Cuisine
                    );

                    results.Add(new
                    {
                        restaurant.Name,
                        restaurant.Address,
                        restaurant.Rating,
                        restaurant.PriceLevel,
                        restaurant.Distance,
                        restaurant.PhotoUrl,
                        aiRecommendations = recommendations
                    });
                }

                return Ok(new { restaurants = results });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to search restaurants", error = ex.Message });
            }
        }
    }

    public class RestaurantSearchRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int? RadiusMeters { get; set; }
        public string? Cuisine { get; set; }
    }
}
