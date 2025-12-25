namespace TruLife.API.DTOs
{
    // Auth DTOs
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Name { get; set; } // Single name field from frontend
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
    
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }
    
    // Profile DTOs
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public double? HeightCm { get; set; }
        public double? CurrentWeightKg { get; set; }
        public double? TargetWeightKg { get; set; }
        public string? FitnessGoal { get; set; }
        public string? ActivityLevel { get; set; }
        public string? DietaryPreferences { get; set; }
        public int? CoupleProfileId { get; set; }
    }
    
    public class UpdateProfileRequest
    {
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public double? HeightCm { get; set; }
        public double? CurrentWeightKg { get; set; }
        public double? TargetWeightKg { get; set; }
        public string? FitnessGoal { get; set; }
        public string? ActivityLevel { get; set; }
        public string? DietaryPreferences { get; set; }
    }
    
    // Readiness DTOs
    public class ReadinessLogDto
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public int SleepQuality { get; set; }
        public int StressLevel { get; set; }
        public int SorenessLevel { get; set; }
        public int EnergyLevel { get; set; }
        public int MotivationLevel { get; set; }
        public double? HoursSlept { get; set; }
        public string? Notes { get; set; }
        public int ReadinessScore { get; set; } // Calculated average
    }
    
    public class CreateReadinessLogRequest
    {
        public int SleepQuality { get; set; }
        public int StressLevel { get; set; }
        public int SorenessLevel { get; set; }
        public int EnergyLevel { get; set; }
        public int MotivationLevel { get; set; }
        public double? HoursSlept { get; set; }
        public string? Notes { get; set; }
    }
    
    // Workout DTOs
    public class GenerateWorkoutRequest
    {
        public int? EnvironmentId { get; set; }
        public string FitnessGoal { get; set; } = string.Empty;
        public bool UseReadinessScore { get; set; } = true;
    }
    
    public class WorkoutSessionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? WorkoutData { get; set; }
        public int? DurationMinutes { get; set; }
    }
    
    // Nutrition DTOs
    public class AnalyzeMealPhotoRequest
    {
        public string Base64Image { get; set; } = string.Empty;
    }
    
    
    public class MealAnalysisResponse
    {
        public string MealName { get; set; } = string.Empty;
        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbs { get; set; }
        public double Fats { get; set; }
        public List<string> Ingredients { get; set; } = new();
        public string Confidence { get; set; } = string.Empty;
    }
    
    public class CreateMealLogRequest
    {
        public string MealName { get; set; } = string.Empty;
        public string? MealType { get; set; }
        public double Calories { get; set; }
        public double ProteinGrams { get; set; }
        public double CarbsGrams { get; set; }
        public double FatsGrams { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Notes { get; set; }
    }
    
    public class CalculateMacrosRequest
    {
        public double CurrentWeightKg { get; set; }
        public double TargetWeightKg { get; set; }
        public string FitnessGoal { get; set; } = string.Empty;
        public string ActivityLevel { get; set; } = string.Empty;
    }
    
    public class MacroTargetDto
    {
        public double DailyCalories { get; set; }
        public double ProteinGrams { get; set; }
        public double CarbsGrams { get; set; }
        public double FatsGrams { get; set; }
    }
    
    // Couples DTOs
    public class CreateCouplePairingRequest
    {
        public string PartnerEmail { get; set; } = string.Empty;
    }
    
    public class CoupleProfileDto
    {
        public int Id { get; set; }
        public int PartnerAId { get; set; }
        public string PartnerAName { get; set; } = string.Empty;
        public int PartnerBId { get; set; }
        public string PartnerBName { get; set; } = string.Empty;
        public DateTime PairedAt { get; set; }
        public string? CoupleName { get; set; }
    }
    
    public class CreateChallengeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ChallengeType { get; set; } = "Competitive";
        public string? Metric { get; set; }
        public double? PartnerATarget { get; set; }
        public double? PartnerBTarget { get; set; }
        public string? RewardDescription { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    
    public class GenerateRomanticEveningRequest
    {
        public string PartnerAPreferences { get; set; } = string.Empty;
        public string PartnerBPreferences { get; set; } = string.Empty;
    }
}
