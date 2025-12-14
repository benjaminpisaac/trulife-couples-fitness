using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class CoupleProfile
    {
        [Key]
        public int Id { get; set; }
        
        public int PartnerAId { get; set; }
        public User PartnerA { get; set; } = null!;
        
        public int PartnerBId { get; set; }
        public User PartnerB { get; set; } = null!;
        
        public DateTime PairedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        [MaxLength(200)]
        public string? CoupleName { get; set; } // Optional nickname for the couple
        
        public ICollection<CoupleChallenge> Challenges { get; set; } = new List<CoupleChallenge>();
        public ICollection<CoupleGoal> Goals { get; set; } = new List<CoupleGoal>();
        public ICollection<RomanticEvening> RomanticEvenings { get; set; } = new List<RomanticEvening>();
        public ICollection<CoupleMessage> Messages { get; set; } = new List<CoupleMessage>();
    }
    
    public class CoupleChallenge
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [MaxLength(50)]
        public string ChallengeType { get; set; } = "Competitive"; // "Competitive", "Cooperative"
        
        public string? Metric { get; set; } // "Weight Loss", "Body Fat %", "Steps", "Workout Hours"
        
        public double? PartnerATarget { get; set; }
        public double? PartnerBTarget { get; set; }
        public double? PartnerAProgress { get; set; }
        public double? PartnerBProgress { get; set; }
        
        public string? RewardDescription { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsCompleted { get; set; } = false;
        
        public int? WinnerId { get; set; } // For competitive challenges
    }
    
    public class CoupleGoal
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [MaxLength(50)]
        public string GoalType { get; set; } = "Cooperative"; // "Cooperative", "Romantic Attraction"
        
        public string? Metric { get; set; }
        public double? TargetValue { get; set; }
        public double? CurrentProgress { get; set; }
        
        // For Romantic Attraction goals
        public int? InspiringPartnerId { get; set; } // Partner whose preferences inspired the goal
        public string? AttractionPreference { get; set; } // What the inspiring partner finds attractive
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public bool IsCompleted { get; set; } = false;
    }
    
    public class RomanticAttractionPoll
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        public int RespondentId { get; set; } // User who filled out the poll
        public User Respondent { get; set; } = null!;
        
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        
        // Reciprocal preferences (what this user finds attractive in their partner)
        public string? PreferredAmbience { get; set; } // JSON array
        public string? PreferredFlavors { get; set; } // JSON array
        public string? PreferredActivities { get; set; } // JSON array
        public string? PreferredIntimacyLevel { get; set; }
        public string? PreferredBodyAttributes { get; set; } // JSON array
        public string? AdditionalPreferences { get; set; } // JSON with other preferences
    }
    
    public class RomanticEvening
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ScheduledDate { get; set; }
        
        // AI-generated plan with fusion logic
        public string? OverallTheme { get; set; }
        public string? Ambience { get; set; }
        
        // Partner A's meal (designed by Partner B's preferences)
        public string? PartnerAMealName { get; set; }
        public string? PartnerAMealRecipe { get; set; } // JSON with ingredients, instructions
        public string? PartnerAMealMacros { get; set; } // JSON with macro breakdown
        
        // Partner B's meal (designed by Partner A's preferences)
        public string? PartnerBMealName { get; set; }
        public string? PartnerBMealRecipe { get; set; }
        public string? PartnerBMealMacros { get; set; }
        
        public string? SuggestedActivities { get; set; } // JSON array
        public string? MoodMusic { get; set; } // JSON array of song suggestions
        
        public bool IsFavorite { get; set; } = false;
        public bool IsCompleted { get; set; } = false;
        
        public string? FeedbackNotes { get; set; }
    }
    
    public class CoupleMessage
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;
        
        public int RecipientId { get; set; }
        public User Recipient { get; set; } = null!;
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(50)]
        public string MessageType { get; set; } = "Text"; // "Text", "Flirt", "Focus"
        
        public string Content { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
    }
}
