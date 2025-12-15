using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class Environment
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // "Home Gym", "Commercial Gym", etc.
        
        public string? PhotoUrl { get; set; } // URL to uploaded photo
        public string? AvailableEquipment { get; set; } // JSON array of equipment detected by AI
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
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
        public string? SplitType { get; set; } // "PPL", "Upper/Lower", "Full Body", etc.
        public DateTime StartDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        public ICollection<WorkoutSession> Sessions { get; set; } = new List<WorkoutSession>();
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
    
    public class WorkoutSession
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int? ProgramId { get; set; }
        public WorkoutProgram? Program { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public DateTime ScheduledDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsCompleted { get; set; } = false;
        
        public int? EnvironmentId { get; set; }
        public Environment? Environment { get; set; }
        
        public string? WorkoutData { get; set; } // JSON with exercises, sets, reps
        public int? DurationMinutes { get; set; }
        public string? Notes { get; set; }
        
        public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
    }
    
    public class Exercise
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public string? MuscleGroup { get; set; } // "Chest", "Back", "Legs", etc.
        public string? EquipmentRequired { get; set; } // "Barbell", "Dumbbells", "Bodyweight", etc.
        public string? VideoUrl { get; set; }
    }
    
    public class WorkoutExercise
    {
        [Key]
        public int Id { get; set; }
        
        public int WorkoutSessionId { get; set; }
        public WorkoutSession WorkoutSession { get; set; } = null!;
        
        public int ExerciseId { get; set; }
        public Exercise Exercise { get; set; } = null!;
        
        public int OrderIndex { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public double? WeightKg { get; set; }
        public int? RestSeconds { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; } = false;
    }
}
