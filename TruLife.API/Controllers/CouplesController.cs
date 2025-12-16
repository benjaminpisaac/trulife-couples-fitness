using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TruLife.API.Services;
using TruLife.API.Models;

namespace TruLife.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CouplesController : ControllerBase
    {
        private readonly CouplesService _couplesService;
        private readonly TransformationAnalysisService _transformationService;

        public CouplesController(CouplesService couplesService, TransformationAnalysisService transformationService)
        {
            _couplesService = couplesService;
            _transformationService = transformationService;
        }

        [HttpPost("judge-challenge")]
        public async Task<IActionResult> JudgeChallenge([FromBody] JudgeChallengeRequest request)
        {
            try
            {
                // Analyze Partner A transformation
                var partnerAAnalysis = await _transformationService.AnalyzeTransformation(
                    request.PartnerABeforePhoto,
                    request.PartnerAAfterPhoto,
                    "A"
                );

                // Analyze Partner B transformation
                var partnerBAnalysis = await _transformationService.AnalyzeTransformation(
                    request.PartnerBBeforePhoto,
                    request.PartnerBAfterPhoto,
                    "B"
                );

                // Determine winner
                var winner = _transformationService.DetermineWinner(
                    partnerAAnalysis,
                    partnerBAnalysis,
                    request.PartnerAPoints,
                    request.PartnerBPoints,
                    request.PartnerAConsistencyDays,
                    request.PartnerBConsistencyDays,
                    request.TotalChallengeDays
                );

                return Ok(new
                {
                    winner = winner,
                    partnerAAnalysis = partnerAAnalysis,
                    partnerBAnalysis = partnerBAnalysis
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error judging challenge: {ex.Message}" });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetCoupleProfile()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var profile = await _couplesService.GetCoupleProfile(userId);
                if (profile == null)
                {
                    return NotFound(new { message = "No couple profile found" });
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("pair")]
        public async Task<IActionResult> CreatePairing([FromBody] PairingRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _couplesService.CreatePairing(userId, request.PartnerEmail);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("challenges")]
        public async Task<IActionResult> GetChallenges()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var challenges = await _couplesService.GetChallenges(userId);
                return Ok(challenges);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("romantic-evening")]
        public async Task<IActionResult> GenerateRomanticEvening()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var evening = await _couplesService.GenerateRomanticEvening(userId);
                return Ok(evening);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class JudgeChallengeRequest
    {
        public string PartnerABeforePhoto { get; set; } = "";
        public string PartnerAAfterPhoto { get; set; } = "";
        public string PartnerBBeforePhoto { get; set; } = "";
        public string PartnerBAfterPhoto { get; set; } = "";
        public int PartnerAPoints { get; set; }
        public int PartnerBPoints { get; set; }
        public int PartnerAConsistencyDays { get; set; }
        public int PartnerBConsistencyDays { get; set; }
        public int TotalChallengeDays { get; set; }
    }

    public class PairingRequest
    {
        public string PartnerEmail { get; set; } = "";
    }
}
