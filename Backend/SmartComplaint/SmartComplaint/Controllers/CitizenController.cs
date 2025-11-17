using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;
using SmartComplaint.Models;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitizenController : ControllerBase
    {
        private readonly CitizenService _service;
        private readonly ILogger<CitizenController> _logger;

        public CitizenController(CitizenService service, ILogger<CitizenController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> CreateCitizen([FromBody] CitizenDto.CitizenCreateDto dto)
        {
            _logger.LogInformation("Creating new citizen with email: {Email}", dto.Email);
            
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _service.CreateCitizenAsync(dto);
                _logger.LogInformation("Citizen created successfully with ID: {CitizenId}", result.CitizenId);
                return CreatedAtAction(nameof(GetCitizenById), new { id = result.CitizenId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create citizen with email: {Email}", dto.Email);
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest($"Error: {ex.Message}. Inner: {innerMessage}");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> GetCitizenById(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid citizen ID");

            var citizen = await _service.GetCitizenByIdAsync(id);
            return citizen == null ? NotFound() : Ok(citizen);
        }

        [HttpPost("profile")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> GetCitizenProfile([FromBody] CitizenIdRequest request)
        {
            if (string.IsNullOrEmpty(request.CitizenId))
                return BadRequest("Invalid citizen ID");

            var citizen = await _service.GetCitizenByIdAsync(request.CitizenId);
            return citizen == null ? NotFound() : Ok(citizen);
        }

        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> GetCitizenByEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("Invalid email");

            var citizen = await _service.GetCitizenByEmailAsync(email);
            return citizen == null ? NotFound() : Ok(citizen);
        }



        [HttpGet]
         [Authorize(Roles = "Admin")]  
        public async Task<ActionResult<IEnumerable<CitizenDto.CitizenReadDto>>> GetAllCitizens()
        {
            var citizens = await _service.GetAllCitizensAsync();
            return Ok(citizens);
        }

        [HttpPut("{id}")]
         [Authorize(Roles = "Citizen")]  
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> UpdateCitizen(string id, [FromBody] CitizenDto.CitizenUpdateDto dto)
        {
            _logger.LogInformation("Updating citizen with ID: {CitizenId}", id);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for citizen update: {CitizenId}", id);
                return BadRequest(ModelState);
            }

            try
            {
                dto.CitizenId = id; 
                var updated = await _service.UpdateCitizenAsync(dto);
                if (updated == null)
                {
                    _logger.LogWarning("Citizen not found for update: {CitizenId}", id);
                    return NotFound();
                }
                _logger.LogInformation("Citizen updated successfully: {CitizenId}", id);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update citizen: {CitizenId}", id);
                return BadRequest("Failed to update citizen profile");
            }
        }

        [HttpPut("update")]
        [Authorize(Roles = "Citizen")]  
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> UpdateCitizenProfile([FromBody] CitizenDto.CitizenUpdateDto dto)
        {
            _logger.LogInformation("Updating citizen profile with ID: {CitizenId}", dto.CitizenId);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for citizen profile update: {CitizenId}", dto.CitizenId);
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _service.UpdateCitizenAsync(dto);
                if (updated == null)
                {
                    _logger.LogWarning("Citizen not found for profile update: {CitizenId}", dto.CitizenId);
                    return NotFound();
                }
                _logger.LogInformation("Citizen profile updated successfully: {CitizenId}", dto.CitizenId);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update citizen profile: {CitizenId}", dto.CitizenId);
                return BadRequest("Failed to update citizen profile");
            }
        }

        [HttpDelete("{id}")]
         [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult> DeleteCitizen(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid citizen ID");

            var deleted = await _service.DeleteCitizenAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}