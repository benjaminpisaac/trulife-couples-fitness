using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class ReadinessLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        
        [Range(1, 10)]
        public int SleepQuality { get; set; } // 1-10 scale
        
        [Range(1, 10)]
        public int StressLevel { get; set; } // 1-10 scale
        
        [Range(1, 10)]
        public int SorenessLevel { get; set; } // 1-10 scale
        
        [Range(1, 10)]
        public int EnergyLevel { get; set; } // 1-10 scale
        
        [Range(1, 10)]
        public int MotivationLevel { get; set; } // 1-10 scale
        
        public double? HoursSlept { get; set; }
        public string? Notes { get; set; }
    }
    
    public class WeightLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public double WeightKg { get; set; }
        public double? BodyFatPercentage { get; set; }
        public string? Notes { get; set; }
    }
    
    public class HydrationLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public double WaterIntakeMl { get; set; }
        public int AmountMl { get; set; } // Alternative name for WaterIntakeMl (int for DTO compatibility)
    }
    
    public class AlcoholLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public int StandardDrinks { get; set; }
        public string? DrinkType { get; set; }
    }
    
    public class NEATLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public int Steps { get; set; }
        public int ActiveMinutes { get; set; }
        public double? CaloriesBurned { get; set; }
    }
    
    public class Supplement
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Dosage { get; set; }
        public string? Frequency { get; set; } // "Daily", "Twice Daily", etc.
        public string? Notes { get; set; }
        
        public ICollection<SupplementLog> Logs { get; set; } = new List<SupplementLog>();
    }
    
    public class SupplementLog
    {
        [Key]
        public int Id { get; set; }
        
        public int SupplementId { get; set; }
        public Supplement Supplement { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public bool Taken { get; set; }
    }
    
    public class FastingSession
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Protocol { get; set; } // "16:8", "18:6", "OMAD", etc.
        public bool IsActive { get; set; } = true;
        public string? Notes { get; set; }
    }
    
    public class RecoveryLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        
        public int RecoveryScore { get; set; } // Calculated average
        
        [Range(1, 10)]
        public int SleepQuality { get; set; }
        
        public double? HoursSlept { get; set; }
        
        [Range(1, 10)]
        public int StressLevel { get; set; }
        
        [Range(1, 10)]
        public int MuscleRecovery { get; set; }
        
        public string? Notes { get; set; }
    }
    
    public class RecoveryToolLog
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        [MaxLength(50)]
        public string ToolType { get; set; } = string.Empty; // "Meditation", "IceBath", "Sauna", "Massage"
        
        public int DurationMinutes { get; set; }
        
        [Range(1, 10)]
        public int? Intensity { get; set; } // Optional 1-10 scale
        
        public string? Notes { get; set; }
    }
}
