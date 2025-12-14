using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    // Recovery tracking
    public class RecoveryLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        
        [Range(1, 10)]
        public int RecoveryScore { get; set; } // Overall recovery 1-10
        
        [Range(1, 10)]
        public int SleepQuality { get; set; }
        
        public double? HoursSlept { get; set; }
        
        [Range(1, 10)]
        public int StressLevel { get; set; }
        
        [Range(1, 10)]
        public int MuscleRecovery { get; set; }
        
        public string? Notes { get; set; }
    }
    
    // Progress photos
    public class ProgressPhoto
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime TakenDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string PhotoUrl { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Category { get; set; } = "Front"; // Front, Back, Side
        
        public string? Notes { get; set; }
    }
    
    // User settings
    public class UserSettings
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public bool UseMetric { get; set; } = true;
        public bool EnableNotifications { get; set; } = true;
        public bool ShareDataWithPartner { get; set; } = false;
        
        public string? NotificationPreferences { get; set; } // JSON
    }
    
    // Equipment presets for different gym locations
    public class EquipmentPreset
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // "Home Gym", "LA Fitness", etc.
        
        public string? PhotoUrl { get; set; }
        public string? AvailableEquipment { get; set; } // JSON array
        public bool IsFavorite { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    // Workout programs (multi-week)
    public class WorkoutProgram
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public int DurationWeeks { get; set; }
        public DateTime StartDate { get; set; }
        public bool IsActive { get; set; } = true;
        
        public ICollection<ProgramWeek> Weeks { get; set; } = new List<ProgramWeek>();
    }
    
    public class ProgramWeek
    {
        [Key]
        public int Id { get; set; }
        
        public int WorkoutProgramId { get; set; }
        public WorkoutProgram WorkoutProgram { get; set; } = null!;
        
        public int WeekNumber { get; set; }
        public string? WorkoutPlan { get; set; } // JSON with daily workouts
    }
    
    // Workout feedback
    public class WorkoutFeedback
    {
        [Key]
        public int Id { get; set; }
        
        public int WorkoutSessionId { get; set; }
        public WorkoutSession WorkoutSession { get; set; } = null!;
        
        [Range(1, 10)]
        public int DifficultyRating { get; set; }
        
        [Range(1, 10)]
        public int EnjoymentRating { get; set; }
        
        public string? Notes { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
    
    // AI coaching sessions
    public class CoachingSession
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [MaxLength(50)]
        public string CoachType { get; set; } = "PersonalTrainer"; // PersonalTrainer, MindsetCoach
        
        public string? ConversationHistory { get; set; } // JSON
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastMessageAt { get; set; }
    }
}
