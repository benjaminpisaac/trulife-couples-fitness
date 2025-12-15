using System.ComponentModel.DataAnnotations;

namespace TruLife.API.Models
{
    public class LabResult
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? LabName { get; set; }
        
        public DateTime TestDate { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public string? PdfUrl { get; set; } // URL to uploaded PDF
        public string? FileUrl { get; set; } // Alternative name for PdfUrl
        public bool IsProcessed { get; set; } = false;
        public string? AIInsights { get; set; } // JSON with AI analysis
        public string? AIRecommendations { get; set; } // AI recommendations text
        
        public ICollection<Biomarker> Biomarkers { get; set; } = new List<Biomarker>();
    }
    
    public class Biomarker
    {
        [Key]
        public int Id { get; set; }
        
        public int LabResultId { get; set; }
        public LabResult LabResult { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public double Value { get; set; }
        public string? Unit { get; set; }
        
        public double? ReferenceRangeMin { get; set; }
        public double? ReferenceRangeMax { get; set; }
        public string? ReferenceRange { get; set; } // Formatted range string for DTO
        
        public bool IsAbnormal { get; set; } = false;
        public string? Status { get; set; } // "Normal", "High", "Low", "Critical"
        public string? AIRecommendation { get; set; }
    }
    
    public class DNAAnalysis
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(200)]
        public string TestProvider { get; set; } = string.Empty; // "23andMe", "AncestryDNA", etc.
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public DateTime UploadDate { get; set; } = DateTime.UtcNow; // Alternative name
        public string? RawDataUrl { get; set; } // URL to raw DNA file
        public string? FileUrl { get; set; } // Alternative name for RawDataUrl
        
        public bool IsProcessed { get; set; } = false;
        public string? AIInsights { get; set; } // JSON with overall health insights
        public string? AIRecommendations { get; set; } // AI recommendations text
        
        public ICollection<SNPInterpretation> SNPs { get; set; } = new List<SNPInterpretation>();
        public ICollection<SNPInterpretation> SNPInterpretations { get; set; } = new List<SNPInterpretation>(); // Alternative name for SNPs
    }
    
    public class SNPInterpretation
    {
        [Key]
        public int Id { get; set; }
        
        public int DNAAnalysisId { get; set; }
        public DNAAnalysis DNAAnalysis { get; set; } = null!;
        
        [Required]
        [MaxLength(50)]
        public string SNPId { get; set; } = string.Empty; // e.g., "rs1234567"
        
        public string? Gene { get; set; }
        public string? Genotype { get; set; } // e.g., "AA", "AG", "GG"
        
        [MaxLength(200)]
        public string? HealthTrait { get; set; } // "Caffeine Metabolism", "Vitamin D Absorption", etc.
        
        public string? Impact { get; set; } // "Positive", "Neutral", "Negative"
        public string? Interpretation { get; set; } // Interpretation text for DTO
        public string? AIRecommendation { get; set; }
        public string? Recommendations { get; set; } // Alternative name for AIRecommendation
    }
}
