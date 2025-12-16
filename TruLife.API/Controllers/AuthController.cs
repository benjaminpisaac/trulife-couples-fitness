using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TruLife.API.Data;
using TruLife.API.DTOs;
using TruLife.API.Models;
using TruLife.API.Services;

namespace TruLife.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        private readonly AuthService _authService;
        
        public AuthController(TruLifeDbContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<AuthController>>();
            
            try
            {
                logger.LogInformation("Registration attempt for email: {Email}", request.Email);
                
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    logger.LogWarning("Registration failed: Email already exists - {Email}", request.Email);
                    return Conflict(new { message = "Email already registered" });
                }
                
                // Handle both name formats
                string firstName = request.FirstName;
                string lastName = request.LastName;
                
                if (string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(request.Name))
                {
                    var nameParts = request.Name.Split(' ', 2);
                    firstName = nameParts[0];
                    lastName = nameParts.Length > 1 ? nameParts[1] : "";
                }
                
                logger.LogInformation("Creating user with email: {Email}, firstName: {FirstName}", request.Email, firstName);
                
                // Create user
                var user = new User
                {
                    Email = request.Email,
                    FirstName = firstName,
                    LastName = lastName
                };
                
                try
                {
                    user.PasswordHash = _authService.HashPassword(user, request.Password);
                    logger.LogInformation("Password hashed successfully");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error hashing password");
                    return StatusCode(500, new { message = "Error hashing password", error = ex.Message });
                }
                
                try
                {
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                    logger.LogInformation("User saved to database with ID: {UserId}", user.Id);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error saving user to database");
                    return StatusCode(500, new { message = "Error saving user to database", error = ex.Message, innerError = ex.InnerException?.Message });
                }
                
                // Create empty profile
                try
                {
                    var profile = new UserProfile
                    {
                        UserId = user.Id
                    };
                    
                    _context.UserProfiles.Add(profile);
                    await _context.SaveChangesAsync();
                    logger.LogInformation("User profile created for user ID: {UserId}", user.Id);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error creating user profile");
                    return StatusCode(500, new { message = "Error creating user profile", error = ex.Message, innerError = ex.InnerException?.Message });
                }
                
                // Generate token
                string token;
                try
                {
                    token = _authService.GenerateJwtToken(user);
                    logger.LogInformation("JWT token generated successfully");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error generating JWT token");
                    return StatusCode(500, new { message = "Error generating JWT token", error = ex.Message });
                }
                
                logger.LogInformation("Registration successful for user: {Email}", user.Email);
                
                return Ok(new AuthResponse
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Token = token
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during registration");
                return StatusCode(500, new { message = "Unexpected error during registration", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !_authService.VerifyPassword(user, request.Password))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            // Generate token
            var token = _authService.GenerateJwtToken(user);
            
            return Ok(new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token
            });
        }
    }
}
