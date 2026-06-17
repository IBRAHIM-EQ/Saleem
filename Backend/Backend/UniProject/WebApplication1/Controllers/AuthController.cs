using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Data;
using WebApplication1.Model.EntityDto;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists.");

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.User.ToString()
            };

            var refreshToken = CreateRefreshToken();
            user.RefreshTokens.Add(refreshToken);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var accessToken = CreateJwtToken(user);

            var response = new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = UserRole.User.ToString()
            };

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // --- MASTER ADMIN HARDCODED BYPASS ---
            if (string.Equals(dto.Email, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase) && 
                dto.Password == "SaleemAdmin2026")
            {
                var masterAdmin = await _context.Users
                    .Include(u => u.RefreshTokens)
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);

                if (masterAdmin == null)
                {
                    // Master admin doesn't exist in DB yet, create a dummy token to allow login
                    var dummyAdmin = new User
                    {
                        Id = -1,
                        FirstName = "Master",
                        LastName = "Admin",
                        Email = "Admin@gmail.com",
                        Role = "Admin"
                    };
                    
                    var bypassRefreshToken = CreateRefreshToken();
                    var bypassAccessToken = CreateJwtToken(dummyAdmin);

                    return Ok(new AuthResponseDto
                    {
                        AccessToken = bypassAccessToken,
                        RefreshToken = bypassRefreshToken.Token,
                        Email = dummyAdmin.Email,
                        FullName = $"{dummyAdmin.FirstName} {dummyAdmin.LastName}",
                        Role = "Admin"
                    });
                }
                else
                {
                    // Master admin exists, skip password check and log them in normally
                    var bypassRefreshToken = CreateRefreshToken();
                    masterAdmin.RefreshTokens.Add(bypassRefreshToken);
                    await _context.SaveChangesAsync();

                    var bypassAccessToken = CreateJwtToken(masterAdmin);

                    return Ok(new AuthResponseDto
                    {
                        AccessToken = bypassAccessToken,
                        RefreshToken = bypassRefreshToken.Token,
                        Email = masterAdmin.Email,
                        FullName = $"{masterAdmin.FirstName} {masterAdmin.LastName}",
                        Role = "Admin"
                    });
                }
            }
            // -------------------------------------

            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                return Unauthorized("Invalid email or password.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isPasswordValid)
                return Unauthorized("Invalid email or password.");

            var refreshToken = CreateRefreshToken();
            user.RefreshTokens.Add(refreshToken);

            await _context.SaveChangesAsync();

            var accessToken = CreateJwtToken(user);

            var response = new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role.ToString()
            };

            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto dto)
        {
            var user = await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == dto.RefreshToken));

            if (user == null)
                return Unauthorized("Invalid refresh token.");

            var oldRefreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == dto.RefreshToken);

            if (oldRefreshToken == null || !oldRefreshToken.IsActive)
                return Unauthorized("Refresh token is not active.");

            oldRefreshToken.RevokedAt = DateTime.UtcNow;

            var newRefreshToken = CreateRefreshToken();
            user.RefreshTokens.Add(newRefreshToken);

            await _context.SaveChangesAsync();

            var newAccessToken = CreateJwtToken(user);

            var response = new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role.ToString()
            };

            return Ok(response);
        }

        private string CreateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Token"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        private RefreshToken CreateRefreshToken()
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}
    

