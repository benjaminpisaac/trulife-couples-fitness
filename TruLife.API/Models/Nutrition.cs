using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class MacroTarget
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public double DailyCalories { get; set; }
        public double ProteinGrams { get; set; }
        public double CarbsGrams { get; set; }
        public double FatsGrams { get; set; }
        
        public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
    
    public class MealLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [MaxLength(200)]
        public string MealName { get; set; } = string.Empty;
        
        public string? MealType { get; set; } // "Breakfast", "Lunch", "Dinner", "Snack"
        
        public double Calories { get; set; }
        public double ProteinGrams { get; set; }
        public double CarbsGrams { get; set; }
        public double FatsGrams { get; set; }
        
        public string? PhotoUrl { get; set; } // URL to meal photo
        public bool IsAIAnalyzed { get; set; } = false;
        public string? AIAnalysisData { get; set; } // JSON with AI insights
        
        public string? Notes { get; set; }
    }
    
    public class MealPhoto
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public string PhotoUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public string? AIEstimatedMacros { get; set; } // JSON with estimated macros
        public bool IsProcessed { get; set; } = false;
        
        public int? MealLogId { get; set; }
        public MealLog? MealLog { get; set; }
    }
    
    public class RestaurantRecommendation
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string RestaurantName { get; set; } = string.Empty;
        
        public string? Cuisine { get; set; }
        public string? RecommendedDishes { get; set; } // JSON array
        public string? MacroFriendlyOptions { get; set; } // JSON with macro estimates
        
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
