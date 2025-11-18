using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Data;
using SmartComplaint.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Linq;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TokenController : ControllerBase
    {
        private readonly ComplaintContext _context;
        private readonly IToken _tokenService;

        public TokenController(ComplaintContext context, IToken tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto userData)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                // Sanitize input
                userData.Email = userData.Email?.Trim().ToLower();
                
                var user = await GetUser(userData.Email, userData.Password);
                if (user != null)
                {
                    var token = _tokenService.GenerateToken(user);
                    return Ok(new { token, username = user.Username, role = user.Role });
                }
                else
                {
                    return BadRequest(new { message = "Invalid email or password" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("register/citizen")]
        public async Task<IActionResult> RegisterCitizen(AuthenticationDto.CitizenRegistrationDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                // Sanitize input
                dto.Name = dto.Name?.Trim();
                dto.Email = dto.Email?.Trim().ToLower();
                dto.Address = dto.Address?.Trim();
                dto.State = dto.State?.Trim();
                dto.District = dto.District?.Trim();
                dto.Phone = dto.Phone?.Trim();

                // Check for existing email
                var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingEmail != null)
                    return BadRequest(new { message = "Email already exists" });

                // Check for existing username
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Name);
                if (existingUser != null)
                    return BadRequest(new { message = "Username already exists" });

                // Check for existing phone
                var existingPhone = await _context.Citizens.FirstOrDefaultAsync(c => c.Phone == dto.Phone);
                if (existingPhone != null)
                    return BadRequest(new { message = "Phone number already registered" });

                var newUser = new User
                {
                    Username = dto.Name,
                    Email = dto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = Models.Enums.UserRole.Citizen
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                var citizenId = await GenerateCitizenId(dto.State);
                
                var newCitizen = new Citizen
                {
                    CitizenId = citizenId,
                    Name = dto.Name,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Address = dto.Address,
                    State = dto.State,
                    District = dto.District,
                    UserId = newUser.UserId
                };

                _context.Citizens.Add(newCitizen);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Citizen registered successfully", citizenId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }

        [HttpPost("register/officer")]
        public async Task<IActionResult> RegisterOfficer(AuthenticationDto.OfficerRegistrationDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                // Sanitize input
                dto.Name = dto.Name?.Trim();
                dto.Email = dto.Email?.Trim().ToLower();
                dto.State = dto.State?.Trim();

                // Validate department exists
                var department = await _context.Departments.FindAsync(dto.DepartmentId);
                if (department == null)
                    return BadRequest(new { message = "Invalid department selected" });

                // Check for existing email
                var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingEmail != null)
                    return BadRequest(new { message = "Email already exists" });

                // Check for existing username
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Name);
                if (existingUser != null)
                    return BadRequest(new { message = "Username already exists" });

                var newUser = new User
                {
                    Username = dto.Name,
                    Email = dto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = Models.Enums.UserRole.Officer
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                var officerId = await GenerateOfficerId(dto.Role);
                
                var newOfficer = new Officer
                {
                    OfficerId = officerId,
                    Name = dto.Name,
                    Email = dto.Email,
                    State = dto.State,
                    DepartmentId = dto.DepartmentId,
                    Role = dto.Role,
                    UserId = newUser.UserId
                };

                _context.Officers.Add(newOfficer);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Officer registered successfully. Awaiting admin approval.", officerId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }

        private async Task<User?> GetUser(string email, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
            
            if (user != null)
            {
                // Try BCrypt verification first (for new hashed passwords)
                try
                {
                    if (BCrypt.Net.BCrypt.Verify(password, user.Password))
                        return user;
                }
                catch
                {
                    // If BCrypt fails, try plain text comparison (for admin/existing passwords)
                    if (user.Password == password)
                        return user;
                }
            }
            
            return null;
        }

        private async Task<string> GenerateCitizenId(string state)
        {
            var stateCode = state.Length >= 2 ? state.Substring(0, 2).ToUpper() : "XX";
            var lastCitizen = await _context.Citizens
                .Where(c => c.CitizenId.StartsWith($"CIT{stateCode}"))
                .OrderByDescending(c => c.CitizenId)
                .FirstOrDefaultAsync();
            
            int nextNumber = 1;
            if (lastCitizen != null)
            {
                var numberPart = lastCitizen.CitizenId.Substring(5);
                if (int.TryParse(numberPart, out int lastNumber))
                    nextNumber = lastNumber + 1;
            }
            
            return $"CIT{stateCode}{nextNumber:D3}";
        }

        private async Task<string> GenerateOfficerId(Models.Enums.OfficerRole role)
        {
            var roleCode = role switch
            {
                Models.Enums.OfficerRole.FieldOfficer => "FO",
                Models.Enums.OfficerRole.SeniorOfficer => "SO",
                Models.Enums.OfficerRole.DepartmentHead => "DH",
                Models.Enums.OfficerRole.RegionalHead => "RH",
                Models.Enums.OfficerRole.Commissioner => "CO",
                _ => "XX"
            };
            
            var lastOfficer = await _context.Officers
                .Where(o => o.OfficerId.StartsWith($"OFF{roleCode}"))
                .OrderByDescending(o => o.OfficerId)
                .FirstOrDefaultAsync();
            
            int nextNumber = 1;
            if (lastOfficer != null)
            {
                var numberPart = lastOfficer.OfficerId.Substring(5);
                if (int.TryParse(numberPart, out int lastNumber))
                    nextNumber = lastNumber + 1;
            }
            
            return $"OFF{roleCode}{nextNumber:D3}";
        }
    }
}