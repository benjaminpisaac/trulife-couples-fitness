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
        
        public DateTime TestDate { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public string? PdfUrl { get; set; } // URL to uploaded PDF
        public bool IsProcessed { get; set; } = false;
        public string? AIInsights { get; set; } // JSON with AI analysis
        
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
        public string? RawDataUrl { get; set; } // URL to raw DNA file
        
        public bool IsProcessed { get; set; } = false;
        public string? AIInsights { get; set; } // JSON with overall health insights
        
        public ICollection<SNPInterpretation> SNPs { get; set; } = new List<SNPInterpretation>();
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
        public string? AIRecommendation { get; set; }
    }
}
