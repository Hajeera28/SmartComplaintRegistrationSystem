using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;
using SmartComplaint.Models;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GrievanceController : ControllerBase
    {
        private readonly GrievanceService _service;

        public GrievanceController(GrievanceService service)
        {
            _service = service;
        }

        [HttpPost("raise")]
        [Authorize(Roles = "Citizen")]
        public async Task<ActionResult<GrievanceDto.GrievanceReadDto>> RaiseGrievance([FromForm] GrievanceDto.GrievanceCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? imagePath = null;
                
                if (dto.Image != null)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    Directory.CreateDirectory(uploadsFolder);
                    
                    var fileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(stream);
                    }
                    
                    imagePath = $"/uploads/{fileName}";
                }
                
                var result = await _service.CreateGrievanceAsync(dto, imagePath);
                return CreatedAtAction(nameof(GetGrievanceById), new { id = result.GrievanceId }, result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<GrievanceDto.GrievanceReadDto>> GetGrievanceById(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid grievance ID");

            var grievance = await _service.GetGrievanceByIdAsync(id);
            return grievance == null ? NotFound() : Ok(grievance);
        }

        [HttpGet("citizen/{citizenId}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<IEnumerable<GrievanceDto.GrievanceReadDto>>> GetGrievancesByCitizen(string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Invalid citizen ID");

            var grievances = await _service.GetGrievancesByCitizenAsync(citizenId);
            return Ok(grievances);
        }

        [HttpPost("citizen")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<IEnumerable<GrievanceDto.GrievanceReadDto>>> GetGrievancesByCitizenPayload([FromBody] CitizenIdRequest request)
        {
            if (string.IsNullOrEmpty(request.CitizenId))
                return BadRequest("Invalid citizen ID");

            var grievances = await _service.GetGrievancesByCitizenAsync(request.CitizenId);
            return Ok(grievances);
        }

        [HttpGet("officer/{officerId}")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<GrievanceDto.GrievanceReadDto>>> GetGrievancesByOfficer(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var grievances = await _service.GetGrievancesByOfficerAsync(officerId);
            return Ok(grievances);
        }

        [HttpPost("officer")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<GrievanceDto.GrievanceReadDto>>> GetGrievancesByOfficerPayload([FromBody] OfficerIdRequest request)
        {
            if (string.IsNullOrEmpty(request.OfficerId))
                return BadRequest("Invalid officer ID");

            var grievances = await _service.GetGrievancesByOfficerAsync(request.OfficerId);
            return Ok(grievances);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<GrievanceDto.GrievanceReadDto>>> GetAllGrievances()
        {
            var grievances = await _service.GetAllGrievancesAsync();
            return Ok(grievances);
        }

        [HttpPut("{id}/respond")]
        [Authorize(Roles = "Officer")]
        public async Task<ActionResult<GrievanceDto.GrievanceReadDto>> RespondToGrievance(int id, [FromBody] GrievanceDto.GrievanceUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.GrievanceId)
                return BadRequest("ID mismatch");

            var updated = await _service.UpdateGrievanceResponseAsync(dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Officer")]
        public async Task<ActionResult<GrievanceDto.GrievanceReadDto>> UpdateGrievanceStatus(int id, [FromForm] GrievanceDto.GrievanceStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.GrievanceId)
                return BadRequest("ID mismatch");

            if (dto.StatusId < 1 || dto.StatusId > 4)
                return BadRequest("Invalid status ID (1-4)");

            string? officerImagePath = null;
            
            if (dto.OfficerImage != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "officer-uploads");
                Directory.CreateDirectory(uploadsFolder);
                
                var fileName = $"{Guid.NewGuid()}_{dto.OfficerImage.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.OfficerImage.CopyToAsync(stream);
                }
                
                officerImagePath = $"/officer-uploads/{fileName}";
            }

            var updated = await _service.UpdateGrievanceStatusAsync(dto, officerImagePath);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpPut("status")]
        [Authorize(Roles = "Officer")]
        public async Task<ActionResult<GrievanceDto.GrievanceReadDto>> UpdateGrievanceStatusPayload([FromForm] GrievanceDto.GrievanceStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.StatusId < 1 || dto.StatusId > 4)
                return BadRequest("Invalid status ID (1-4)");

            string? officerImagePath = null;
            
            if (dto.OfficerImage != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "officer-uploads");
                Directory.CreateDirectory(uploadsFolder);
                
                var fileName = $"{Guid.NewGuid()}_{dto.OfficerImage.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.OfficerImage.CopyToAsync(stream);
                }
                
                officerImagePath = $"/officer-uploads/{fileName}";
            }

            var updated = await _service.UpdateGrievanceStatusAsync(dto, officerImagePath);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpGet("exists/{complaintId}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<bool>> CheckGrievanceExists(int complaintId)
        {
            if (complaintId <= 0)
                return BadRequest("Invalid complaint ID");

            var exists = await _service.CheckGrievanceExistsAsync(complaintId);
            return Ok(exists);
        }

        [HttpPost("exists")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<bool>> CheckGrievanceExistsPayload([FromBody] ComplaintIdRequest request)
        {
            if (request.ComplaintId <= 0)
                return BadRequest("Invalid complaint ID");

            var exists = await _service.CheckGrievanceExistsAsync(request.ComplaintId);
            return Ok(exists);
        }

        [HttpDelete("{id}")]
         [Authorize(Roles = "Citizen")]  
        public async Task<ActionResult> DeleteGrievance(int id, [FromQuery] string deletedBy = "System")
        {
            if (id <= 0)
                return BadRequest("Invalid grievance ID");

            var deleted = await _service.DeleteGrievanceAsync(id, deletedBy);
            return deleted ? NoContent() : NotFound();
        }
    }
}