using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        
        // Navigation properties
        public UserProfile? Profile { get; set; }
        public ICollection<ReadinessLog> ReadinessLogs { get; set; } = new List<ReadinessLog>();
        public ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
        public ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
        public ICollection<WeightLog> WeightLogs { get; set; } = new List<WeightLog>();
        public ICollection<HydrationLog> HydrationLogs { get; set; } = new List<HydrationLog>();
        public ICollection<Supplement> Supplements { get; set; } = new List<Supplement>();
        public ICollection<FastingSession> FastingSessions { get; set; } = new List<FastingSession>();
        public ICollection<LabResult> LabResults { get; set; } = new List<LabResult>();
        public ICollection<DNAAnalysis> DNAAnalyses { get; set; } = new List<DNAAnalysis>();
    }
    
    public class UserProfile
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public double? HeightCm { get; set; }
        public double? CurrentWeightKg { get; set; }
        public double? TargetWeightKg { get; set; }
        
        [MaxLength(50)]
        public string? FitnessGoal { get; set; } // "Weight Loss", "Muscle Gain", "Maintenance", etc.
        
        [MaxLength(50)]
        public string? ActivityLevel { get; set; } // "Sedentary", "Lightly Active", "Moderately Active", etc.
        
        // Dietary preferences (comma-separated)
        public string? DietaryPreferences { get; set; } // "Keto,Vegan,Gluten-Free"
        
        // Couple relationship
        public int? CoupleProfileId { get; set; }
        public CoupleProfile? CoupleProfile { get; set; }
    }
}
