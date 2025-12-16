using Microsoft.EntityFrameworkCore;
using TruLife.API.Data;
using TruLife.API.Models;

namespace TruLife.API.Services
{
    public class CouplesService
    {
        private readonly TruLifeDbContext _context;

        public CouplesService(TruLifeDbContext context)
        {
            _context = context;
        }

        public async Task<CoupleProfile?> GetCoupleProfile(string userId)
        {
            var userIdInt = int.Parse(userId);
            
            var coupleProfile = await _context.CoupleProfiles
                .Include(cp => cp.PartnerA)
                .Include(cp => cp.PartnerB)
                .FirstOrDefaultAsync(cp => 
                    (cp.PartnerAId == userIdInt || cp.PartnerBId == userIdInt) && cp.IsActive);

            return coupleProfile;
        }

        public async Task<CoupleProfile> CreatePairing(string userId, string partnerEmail)
        {
            var userIdInt = int.Parse(userId);
            
            // Find partner by email
            var partner = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == partnerEmail);

            if (partner == null)
            {
                throw new Exception("Partner not found with that email");
            }

            if (partner.Id == userIdInt)
            {
                throw new Exception("Cannot pair with yourself");
            }

            // Check if already paired
            var existingPairing = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userIdInt && cp.PartnerBId == partner.Id) ||
                    (cp.PartnerAId == partner.Id && cp.PartnerBId == userIdInt));

            if (existingPairing != null)
            {
                throw new Exception("Already paired with this user");
            }

            // Create couple profile
            var coupleProfile = new CoupleProfile
            {
                PartnerAId = userIdInt,
                PartnerBId = partner.Id,
                PairedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.CoupleProfiles.Add(coupleProfile);
            await _context.SaveChangesAsync();

            return coupleProfile;
        }

        public async Task<List<CoupleChallenge>> GetChallenges(string userId)
        {
            var userIdInt = int.Parse(userId);
            
            var coupleProfile = await _context.CoupleProfiles
                .FirstOrDefaultAsync(cp =>
                    (cp.PartnerAId == userIdInt || cp.PartnerBId == userIdInt) && cp.IsActive);

            if (coupleProfile == null)
            {
                return new List<CoupleChallenge>();
            }

            var challenges = await _context.CoupleChallenges
                .Where(c => c.CoupleProfileId == coupleProfile.Id && c.IsActive)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();

            return challenges;
        }

        public async Task<object> GenerateRomanticEvening(string userId)
        {
            // This would integrate with GeminiService for AI generation
            // For now, return a placeholder
            return new
            {
                theme = "Romantic Italian Evening",
                ambience = "Candlelit dinner with soft music",
                message = "Romantic evening generation - integrate with GeminiService"
            };
        }
    }
}
