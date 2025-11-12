using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace SmartComplaint.Services
{
    public class TokenService : IToken
    {
        private readonly SymmetricSecurityKey _key;
        private readonly ComplaintContext _context;

        public TokenService(IConfiguration configuration, ComplaintContext context)
        {
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
            _context = context;
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username!),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("UserId", user.UserId.ToString())
            };

            // Add specific ID based on role
            if (user.Role == Models.Enums.UserRole.Officer)
            {
                var officer = _context.Officers.FirstOrDefault(o => o.UserId == user.UserId);
                if (officer != null)
                {
                    claims.Add(new Claim("OfficerId", officer.OfficerId));
                    claims.Add(new Claim("OfficerRole", ((int)officer.Role).ToString()));
                }
            }
            else if (user.Role == Models.Enums.UserRole.Citizen)
            {
                var citizen = _context.Citizens.FirstOrDefault(c => c.UserId == user.UserId);
                if (citizen != null)
                {
                    claims.Add(new Claim("CitizenId", citizen.CitizenId));
                }
            }

            var cred = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(2),
                SigningCredentials = cred
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var myToken = tokenHandler.CreateToken(tokenDescription);
            return tokenHandler.WriteToken(myToken);
        }
    }
}