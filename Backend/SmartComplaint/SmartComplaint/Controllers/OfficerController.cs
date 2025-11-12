using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Models.Enums;
using SmartComplaint.Services;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfficerController : ControllerBase
    {
        private readonly OfficerService _service;

        public OfficerController(OfficerService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<ActionResult<OfficerDto.OfficerReadDto>> RegisterOfficer([FromForm] OfficerDto.OfficerCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(OfficerRole), dto.Role))
                return BadRequest("Invalid officer role");

            if (dto.ProofDocument == null)
                return BadRequest("Proof document is required for officer registration");

            try
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "proofs");
                Directory.CreateDirectory(uploadsFolder);
                
                var fileName = $"{Guid.NewGuid()}_{dto.ProofDocument.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProofDocument.CopyToAsync(stream);
                }
                
                var proofDocumentPath = $"/proofs/{fileName}";
                
                var result = await _service.CreateOfficerAsync(dto, proofDocumentPath);
                return CreatedAtAction(nameof(GetOfficerById), new { id = result.OfficerId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
         [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<OfficerDto.OfficerReadDto>> GetOfficerById(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid officer ID");

            var officer = await _service.GetOfficerByIdAsync(id);
            return officer == null ? NotFound() : Ok(officer);
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<OfficerDto.OfficerReadDto>> GetOfficerByUserId(int userId)
        {
            if (userId <= 0)
                return BadRequest("Invalid user ID");

            var officer = await _service.GetOfficerByUserIdAsync(userId);
            return officer == null ? NotFound() : Ok(officer);
        }



        [HttpGet]
         [Authorize(Roles = "Admin")]  
        public async Task<ActionResult<IEnumerable<OfficerDto.OfficerReadDto>>> GetAllOfficers()
        {
            var officers = await _service.GetAllOfficersAsync();
            return Ok(officers);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OfficerDto.OfficerReadDto>>> GetPendingOfficers()
        {
            var officers = await _service.GetPendingOfficersAsync();
            return Ok(officers);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ApproveOfficer(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid officer ID");

            var approved = await _service.ApproveOfficerAsync(id);
            return approved ? Ok("Officer approved successfully") : NotFound();
        }

        [HttpDelete("{id}/deny")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DenyOfficer(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid officer ID");

            var denied = await _service.DenyOfficerAsync(id);
            return denied ? Ok("Officer registration denied") : NotFound();
        }

        [HttpGet("department/{departmentId}")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<OfficerDto.OfficerReadDto>>> GetOfficersByDepartment(int departmentId)
        {
            if (departmentId <= 0)
                return BadRequest("Invalid department ID");

            var officers = await _service.GetOfficersByDepartmentAsync(departmentId);
            return Ok(officers);
        }

        [HttpGet("role/{role}")]
         [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<OfficerDto.OfficerReadDto>>> GetOfficersByRole(OfficerRole role)
        {
            if (!Enum.IsDefined(typeof(OfficerRole), role))
                return BadRequest("Invalid officer role");

            var officers = await _service.GetOfficersByRoleAsync(role);
            return Ok(officers);
        }

        [HttpPut("{id}")]
         [Authorize(Roles = "Officer")]  
        public async Task<ActionResult<OfficerDto.OfficerReadDto>> UpdateOfficer(string id, [FromBody] OfficerDto.OfficerUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(OfficerRole), dto.Role))
                return BadRequest("Invalid officer role");

            dto.OfficerId = id; // Set ID from URL
            var updated = await _service.UpdateOfficerAsync(dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
         [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult> DeleteOfficer(string id, [FromQuery] string deletedBy = "System")
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Invalid officer ID");

            var deleted = await _service.DeleteOfficerAsync(id, deletedBy);
            return deleted ? NoContent() : NotFound();
        }
    }
}