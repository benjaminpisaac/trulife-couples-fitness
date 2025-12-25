using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TruLife.API.Data;
using TruLife.API.DTOs;
using TruLife.API.Models;
using TruLife.API.Services;

namespace TruLife.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        private readonly ILogger<ProfileController> _logger;
        
        public ProfileController(TruLifeDbContext context, AuthService authService, ILogger<ProfileController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null) return NotFound();
            
            // CRITICAL: Create profile if it doesn't exist (prevents data loss bug)
            if (user.Profile == null)
            {
                _logger.LogWarning($"Profile not found for user {userId}, creating new profile");
                user.Profile = new UserProfile
                {
                    UserId = userId.Value,
                    User = user
                };
                _context.UserProfiles.Add(user.Profile);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Created new profile for user {userId}");
            }
            
            return Ok(new UserProfileDto
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DateOfBirth = user.Profile.DateOfBirth,
                Gender = user.Profile.Gender,
                HeightCm = user.Profile.HeightCm,
                CurrentWeightKg = user.Profile.CurrentWeightKg,
                TargetWeightKg = user.Profile.TargetWeightKg,
                FitnessGoal = user.Profile.FitnessGoal,
                ActivityLevel = user.Profile.ActivityLevel,
                DietaryPreferences = user.Profile.DietaryPreferences,
                CoupleProfileId = user.Profile.CoupleProfileId
            });
        }
        
        [HttpPut]
        public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Updating profile for user {userId}");
            
            // Use a transaction to ensure data integrity
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null)
                {
                    _logger.LogError($"User {userId} not found");
                    return NotFound("User not found");
                }
                
                // CRITICAL: Create profile if it doesn't exist
                if (user.Profile == null)
                {
                    _logger.LogWarning($"Profile not found for user {userId}, creating new profile");
                    user.Profile = new UserProfile
                    {
                        UserId = userId.Value,
                        User = user
                    };
                    _context.UserProfiles.Add(user.Profile);
                }
                
                // Update profile fields (only update if provided)
                if (request.DateOfBirth.HasValue)
                    user.Profile.DateOfBirth = request.DateOfBirth;
                
                if (!string.IsNullOrEmpty(request.Gender))
                    user.Profile.Gender = request.Gender;
                
                if (request.HeightCm.HasValue)
                    user.Profile.HeightCm = request.HeightCm;
                
                if (request.CurrentWeightKg.HasValue)
                    user.Profile.CurrentWeightKg = request.CurrentWeightKg;
                
                if (request.TargetWeightKg.HasValue)
                    user.Profile.TargetWeightKg = request.TargetWeightKg;
                
                if (!string.IsNullOrEmpty(request.FitnessGoal))
                    user.Profile.FitnessGoal = request.FitnessGoal;
                
                if (!string.IsNullOrEmpty(request.ActivityLevel))
                    user.Profile.ActivityLevel = request.ActivityLevel;
                
                if (!string.IsNullOrEmpty(request.DietaryPreferences))
                    user.Profile.DietaryPreferences = request.DietaryPreferences;
                
                // CRITICAL: Explicitly save changes
                var savedEntries = await _context.SaveChangesAsync();
                _logger.LogInformation($"Saved {savedEntries} entries for user {userId}");
                
                // Commit transaction
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Successfully updated profile for user {userId}");
                
                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateOfBirth = user.Profile.DateOfBirth,
                    Gender = user.Profile.Gender,
                    HeightCm = user.Profile.HeightCm,
                    CurrentWeightKg = user.Profile.CurrentWeightKg,
                    TargetWeightKg = user.Profile.TargetWeightKg,
                    FitnessGoal = user.Profile.FitnessGoal,
                    ActivityLevel = user.Profile.ActivityLevel,
                    DietaryPreferences = user.Profile.DietaryPreferences,
                    CoupleProfileId = user.Profile.CoupleProfileId
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating profile for user {userId}");
                return StatusCode(500, $"Error saving profile: {ex.Message}");
            }
        }
        
        [HttpPost("onboarding")]
        public async Task<ActionResult<UserProfileDto>> CompleteOnboarding(OnboardingRequest request)
        {
            var userId = _authService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();
            
            _logger.LogInformation($"Completing onboarding for user {userId}");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null) return NotFound("User not found");
                
                // Create or update profile
                if (user.Profile == null)
                {
                    user.Profile = new UserProfile
                    {
                        UserId = userId.Value,
                        User = user
                    };
                    _context.UserProfiles.Add(user.Profile);
                }
                
                // Set all onboarding fields
                user.Profile.DateOfBirth = request.DateOfBirth;
                user.Profile.Gender = request.Gender;
                user.Profile.HeightCm = request.HeightCm;
                user.Profile.CurrentWeightKg = request.CurrentWeightKg;
                user.Profile.TargetWeightKg = request.TargetWeightKg;
                user.Profile.FitnessGoal = request.FitnessGoal;
                user.Profile.ActivityLevel = request.ActivityLevel;
                user.Profile.DietaryPreferences = request.DietaryPreferences;
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation($"Onboarding completed for user {userId}");
                
                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateOfBirth = user.Profile.DateOfBirth,
                    Gender = user.Profile.Gender,
                    HeightCm = user.Profile.HeightCm,
                    CurrentWeightKg = user.Profile.CurrentWeightKg,
                    TargetWeightKg = user.Profile.TargetWeightKg,
                    FitnessGoal = user.Profile.FitnessGoal,
                    ActivityLevel = user.Profile.ActivityLevel,
                    DietaryPreferences = user.Profile.DietaryPreferences,
                    CoupleProfileId = user.Profile.CoupleProfileId
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error completing onboarding for user {userId}");
                return StatusCode(500, $"Error saving onboarding data: {ex.Message}");
            }
        }
    }
}
