namespace TruLife.API.DTOs
{
    // Additional DTOs for new features
    
    // Onboarding
    public class OnboardingRequest
    {
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public double? HeightCm { get; set; }
        public double? CurrentWeightKg { get; set; }
        public double? TargetWeightKg { get; set; }
        public string? FitnessGoal { get; set; }
        public string? ActivityLevel { get; set; }
        public string? DietaryPreferences { get; set; }
        public string? Ethnicity { get; set; }
        public string? MedicalConditions { get; set; }
        public string? Medications { get; set; }
    }
    
    // Recovery
    public class RecoveryLogDto
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public int RecoveryScore { get; set; }
        public int SleepQuality { get; set; }
        public double? HoursSlept { get; set; }
        public int StressLevel { get; set; }
        public int MuscleRecovery { get; set; }
        public string? Notes { get; set; }
    }
    
    public class CreateRecoveryLogRequest
    {
        public int SleepQuality { get; set; }
        public double? HoursSlept { get; set; }
        public int StressLevel { get; set; }
        public int MuscleRecovery { get; set; }
        public string? Notes { get; set; }
    }
    
    // Progress Photos
    public class ProgressPhotoDto
    {
        public int Id { get; set; }
        public DateTime TakenDate { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
    
    public class UploadProgressPhotoRequest
    {
        public string Base64Image { get; set; } = string.Empty;
        public string Category { get; set; } = "Front";
        public string? Notes { get; set; }
    }
    
    // Equipment Presets
    public class EquipmentPresetDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public List<string> AvailableEquipment { get; set; } = new();
        public bool IsFavorite { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class CreateEquipmentPresetRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Base64Image { get; set; }
        public List<string>? AvailableEquipment { get; set; }
    }
    
    public class AnalyzeEquipmentRequest
    {
        public string Base64Image { get; set; } = string.Empty;
    }
    
    public class EquipmentAnalysisResponse
    {
        public List<string> DetectedEquipment { get; set; } = new();
        public string SpaceAssessment { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
    
    // Workout Programs
    public class WorkoutProgramDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationWeeks { get; set; }
        public DateTime StartDate { get; set; }
        public bool IsActive { get; set; }
        public List<ProgramWeekDto> Weeks { get; set; } = new();
    }
    
    public class ProgramWeekDto
    {
        public int Id { get; set; }
        public int WeekNumber { get; set; }
        public string? WorkoutPlan { get; set; }
    }
    
    public class CreateWorkoutProgramRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationWeeks { get; set; }
        public string FitnessGoal { get; set; } = string.Empty;
    }
    
    // Workout Feedback
    public class WorkoutFeedbackDto
    {
        public int Id { get; set; }
        public int WorkoutSessionId { get; set; }
        public int DifficultyRating { get; set; }
        public int EnjoymentRating { get; set; }
        public string? Notes { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
    
    public class SubmitWorkoutFeedbackRequest
    {
        public int WorkoutSessionId { get; set; }
        public int DifficultyRating { get; set; }
        public int EnjoymentRating { get; set; }
        public string? Notes { get; set; }
    }
    
    // AI Coaching
    public class CoachingMessageRequest
    {
        public string CoachType { get; set; } = "PersonalTrainer";
        public string Message { get; set; } = string.Empty;
    }
    
    public class CoachingMessageResponse
    {
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
    
    // Labs
    public class LabResultDto
    {
        public int Id { get; set; }
        public DateTime TestDate { get; set; }
        public string? LabName { get; set; }
        public string? FileUrl { get; set; }
        public List<BiomarkerDto> Biomarkers { get; set; } = new();
        public string? AIRecommendations { get; set; }
    }
    
    public class BiomarkerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Value { get; set; }
        public string? Unit { get; set; }
        public string? ReferenceRange { get; set; }
        public string? Status { get; set; }
    }
    
    public class UploadLabResultRequest
    {
        public string Base64Pdf { get; set; } = string.Empty;
        public DateTime TestDate { get; set; }
        public string? LabName { get; set; }
    }
    
    // DNA
    public class DNAAnalysisDto
    {
        public int Id { get; set; }
        public DateTime UploadDate { get; set; }
        public string? FileUrl { get; set; }
        public List<SNPInterpretationDto> SNPs { get; set; } = new();
        public string? AIRecommendations { get; set; }
    }
    
    public class SNPInterpretationDto
    {
        public int Id { get; set; }
        public string SNPId { get; set; } = string.Empty;
        public string Gene { get; set; } = string.Empty;
        public string Genotype { get; set; } = string.Empty;
        public string? Interpretation { get; set; }
        public string? Recommendations { get; set; }
    }
    
    public class UploadDNARequest
    {
        public string Base64File { get; set; } = string.Empty;
    }
    
    // Hydration
    public class HydrationLogDto
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public int AmountMl { get; set; }
    }
    
    public class LogHydrationRequest
    {
        public int AmountMl { get; set; }
    }
    
    // Couples Enhanced
    public class CoupleAttractionDto
    {
        public int Id { get; set; }
        public string? PartnerA_PreferredAmbience { get; set; }
        public string? PartnerA_PreferredFlavors { get; set; }
        public string? PartnerA_PreferredActivities { get; set; }
        public string? PartnerA_AttractionGoals { get; set; }
        public string? PartnerB_PreferredAmbience { get; set; }
        public string? PartnerB_PreferredFlavors { get; set; }
        public string? PartnerB_PreferredActivities { get; set; }
        public string? PartnerB_AttractionGoals { get; set; }
    }
    
    public class SaveAttunementPollRequest
    {
        public string? PreferredAmbience { get; set; }
        public string? PreferredFlavors { get; set; }
        public string? PreferredActivities { get; set; }
        public string? AttractionGoals { get; set; }
    }
    
    public class MoodAdjustmentRequest
    {
        public int RomanticEveningId { get; set; }
        public string CurrentMood { get; set; } = string.Empty;
        public string EnergyLevel { get; set; } = string.Empty;
    }
    
    public class MoodAdjustmentResponse
    {
        public string AdjustedRecipe { get; set; } = string.Empty;
        public string AdjustedActivities { get; set; } = string.Empty;
    }
    
    public class SendCoupleMessageRequest
    {
        public string MessageText { get; set; } = string.Empty;
        public string MessageType { get; set; } = "text";
    }
    
    public class ProposeUpgradeRequest
    {
        public string TargetType { get; set; } = string.Empty;
        public int TargetId { get; set; }
        public string ProposedChanges { get; set; } = string.Empty;
    }
    
    public class RespondUpgradeRequest
    {
        public bool Approved { get; set; }
    }

    // DNA Analysis DTOs
    public class SNPExtractionResult
    {
        public string? Rs1815739 { get; set; }
        public string? Rs4340 { get; set; }
        public string? Rs4253778 { get; set; }
        public string? Rs9939609 { get; set; }
        public string? Rs2228570 { get; set; }
        public string? Rs762551 { get; set; }
        public string? Rs1801133 { get; set; }
        public string? Rs12722 { get; set; }
        public string? Rs1049434 { get; set; }
    }
    
    public class GeneticInterpretationResult
    {
        public string TrainingRecommendation { get; set; } = string.Empty;
        public string NutritionRecommendation { get; set; } = string.Empty;
        public List<string> SupplementRecommendations { get; set; } = new();
        public List<string> InjuryRiskFactors { get; set; } = new();
        public string AnalysisSummary { get; set; } = string.Empty;
    }
    
    public class GeneticProfileResponse
    {
        public int Id { get; set; }
        public DateTime UploadDate { get; set; }
        public string DataSource { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public string? Actn3Rs1815739 { get; set; }
        public string? AceRs4340 { get; set; }
        public string? PparaRs4253778 { get; set; }
        public string? FtoRs9939609 { get; set; }
        public string? VdrRs2228570 { get; set; }
        public string? Cyp1a2Rs762551 { get; set; }
        public string? MthfrRs1801133 { get; set; }
        public string? Col5a1Rs12722 { get; set; }
        public string? Mct1Rs1049434 { get; set; }
        public string? TrainingRecommendation { get; set; }
        public string? NutritionRecommendation { get; set; }
        public List<string>? SupplementRecommendations { get; set; }
        public List<string>? InjuryRiskFactors { get; set; }
        public string? AnalysisSummary { get; set; }
    }

    // Lab Analysis DTOs
    public class LabAnalysisResult
    {
        public string AnalysisSummary { get; set; } = string.Empty;
        public string NutritionalRecommendations { get; set; } = string.Empty;
        public List<string> SupplementRecommendations { get; set; } = new();
        public List<string> LifestyleRecommendations { get; set; } = new();
        public List<string> AreasOfConcern { get; set; } = new();
        public List<string> PositiveFindings { get; set; } = new();
    }
    
    public class LabResultEnhancedResponse
    {
        public int Id { get; set; }
        public DateTime TestDate { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public string? AnalysisSummary { get; set; }
        public string? NutritionalRecommendations { get; set; }
        public List<string>? SupplementRecommendations { get; set; }
        public List<string>? LifestyleRecommendations { get; set; }
        public List<string>? AreasOfConcern { get; set; }
        public List<string>? PositiveFindings { get; set; }
    }
}
