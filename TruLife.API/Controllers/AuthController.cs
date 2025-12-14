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
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }
            
            // Create user
            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };
            
            user.PasswordHash = _authService.HashPassword(user, request.Password);
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Create empty profile
            var profile = new UserProfile
            {
                UserId = user.Id
            };
            
            _context.UserProfiles.Add(profile);
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
