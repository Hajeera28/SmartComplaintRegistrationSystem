using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitizenController : ControllerBase
    {
        private readonly CitizenService _service;

        public CitizenController(CitizenService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<CitizenDto.CitizenReadDto>> CreateCitizen([FromBody] CitizenDto.CitizenCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _service.CreateCitizenAsync(dto);
                return CreatedAtAction(nameof(GetCitizenById), new { id = result.CitizenId }, result);
            }
            catch (Exception ex)
            {
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            dto.CitizenId = id; 
            var updated = await _service.UpdateCitizenAsync(dto);
            return updated == null ? NotFound() : Ok(updated);
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