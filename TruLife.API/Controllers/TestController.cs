using Microsoft.AspNetCore.Mvc;
using TruLife.API.Data;

namespace TruLife.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly TruLifeDbContext _context;
        
        public TestController(TruLifeDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "Backend is running!", timestamp = DateTime.UtcNow });
        }
        
        [HttpGet("db")]
        public IActionResult TestDatabase()
        {
            try
            {
                var userCount = _context.Users.Count();
                return Ok(new { status = "Database connected!", userCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }
}
