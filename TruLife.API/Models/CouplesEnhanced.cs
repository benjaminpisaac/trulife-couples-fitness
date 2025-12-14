using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    // Enhanced couples models
    
    // Romantic Attunement Poll
    public class CoupleAttraction
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        public int PartnerAId { get; set; }
        public int PartnerBId { get; set; }
        
        // Partner A's preferences for Partner B
        public string? PartnerA_PreferredAmbience { get; set; } // "Candlelit", "Outdoor", "Cozy"
        public string? PartnerA_PreferredFlavors { get; set; } // "Italian", "Asian", "Spicy"
        public string? PartnerA_PreferredActivities { get; set; } // "Dancing", "Movie", "Games"
        public string? PartnerA_AttractionGoals { get; set; } // "Toned arms", "Strong back"
        
        // Partner B's preferences for Partner A
        public string? PartnerB_PreferredAmbience { get; set; }
        public string? PartnerB_PreferredFlavors { get; set; }
        public string? PartnerB_PreferredActivities { get; set; }
        public string? PartnerB_AttractionGoals { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
    
    // Mood adjustments for romantic evenings
    public class MoodAdjustment
    {
        [Key]
        public int Id { get; set; }
        
        public int RomanticEveningId { get; set; }
        public RomanticEvening RomanticEvening { get; set; } = null!;
        
        [MaxLength(50)]
        public string CurrentMood { get; set; } = string.Empty; // "Tired", "Energetic", "Romantic"
        
        [MaxLength(50)]
        public string EnergyLevel { get; set; } = string.Empty; // "Low", "Medium", "High"
        
        public string? AdjustedRecipe { get; set; }
        public string? AdjustedActivities { get; set; }
        public DateTime AdjustedAt { get; set; } = DateTime.UtcNow;
    }
    
    // Preset flirt/focus messages
    public class FlirtMessage
    {
        [Key]
        public int Id { get; set; }
        
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // "Flirt", "Focus", "Encouragement"
        
        [Required]
        [MaxLength(500)]
        public string MessageText { get; set; } = string.Empty;
        
        public bool IsPreset { get; set; } = true;
    }
    
    // Experience upgrade proposals
    public class UpgradeProposal
    {
        [Key]
        public int Id { get; set; }
        
        public int CoupleProfileId { get; set; }
        public CoupleProfile CoupleProfile { get; set; } = null!;
        
        public int ProposerId { get; set; }
        
        [MaxLength(50)]
        public string TargetType { get; set; } = string.Empty; // "challenge", "date_night", "goal"
        
        public int TargetId { get; set; }
        public string? ProposedChanges { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // "pending", "approved", "rejected"
        
        public DateTime ProposedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }
    }
}
