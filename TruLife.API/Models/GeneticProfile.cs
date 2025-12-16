using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class GeneticProfile
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        public DateTime UploadDate { get; set; }
        
        [MaxLength(50)]
        public string DataSource { get; set; } = string.Empty; // "23andme", "ancestrydna", etc.
        
        public string? FileUrl { get; set; }
        
        // SNP Genotypes (fitness-relevant genes)
        [MaxLength(20)]
        public string? Actn3Rs1815739 { get; set; } // Sprint gene (RR/RX/XX)
        
        [MaxLength(20)]
        public string? AceRs4340 { get; set; } // Endurance gene (DD/ID/II)
        
        [MaxLength(20)]
        public string? PparaRs4253778 { get; set; } // Fat metabolism
        
        [MaxLength(20)]
        public string? FtoRs9939609 { get; set; } // Obesity risk
        
        [MaxLength(20)]
        public string? VdrRs2228570 { get; set; } // Vitamin D receptor
        
        [MaxLength(20)]
        public string? Cyp1a2Rs762551 { get; set; } // Caffeine metabolism
        
        [MaxLength(20)]
        public string? MthfrRs1801133 { get; set; } // Folate metabolism
        
        [MaxLength(20)]
        public string? Col5a1Rs12722 { get; set; } // Injury risk
        
        [MaxLength(20)]
        public string? Mct1Rs1049434 { get; set; } // Lactate clearance
        
        // AI Analysis Results
        public string? TrainingRecommendation { get; set; } // "Power-biased", "Endurance-biased", "Balanced hybrid"
        
        public string? NutritionRecommendation { get; set; }
        
        public string? SupplementRecommendations { get; set; } // JSON array stored as string
        
        public string? InjuryRiskFactors { get; set; } // JSON array stored as string
        
        public string? AnalysisSummary { get; set; } // 2-3 paragraph summary
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
