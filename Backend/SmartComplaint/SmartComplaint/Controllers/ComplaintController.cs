using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;
using SmartComplaint.Models;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComplaintController : ControllerBase
    {
        private readonly ComplaintService _service;

        public ComplaintController(ComplaintService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Citizen")]
        public async Task<ActionResult<ComplaintDto.ComplaintReadDto>> CreateComplaint([FromForm] ComplaintDto.ComplaintCreateDto dto)
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
                
                var result = await _service.CreateComplaintAsync(dto, imagePath);
                return CreatedAtAction(nameof(GetComplaintById), new { id = result.ComplaintId }, result);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest($"Error: {ex.Message}. Inner: {innerMessage}");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Citizen,Officer")]
        public async Task<ActionResult<ComplaintDto.ComplaintReadDto>> GetComplaintById(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid complaint ID");

            var complaint = await _service.GetComplaintByIdAsync(id);
            return complaint == null ? NotFound() : Ok(complaint);
        }

        [HttpPost("details")]
        [Authorize(Roles = "Citizen,Officer")]
        public async Task<ActionResult<ComplaintDto.ComplaintReadDto>> GetComplaintByIdPayload([FromBody] ComplaintIdRequest request)
        {
            if (request.ComplaintId <= 0)
                return BadRequest("Invalid complaint ID");

            var complaint = await _service.GetComplaintByIdAsync(request.ComplaintId);
            return complaint == null ? NotFound() : Ok(complaint);
        }

        [HttpGet("citizen/{citizenId}")]
        [Authorize(Roles = "Admin,Citizen")]
        public async Task<ActionResult<IEnumerable<ComplaintDto.ComplaintReadDto>>> GetComplaintsByCitizen(string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Invalid citizen ID");

            var complaints = await _service.GetComplaintsByCitizenAsync(citizenId);
            return Ok(complaints);
        }

        [HttpPost("citizen")]
        [Authorize(Roles = "Admin,Citizen")]
        public async Task<ActionResult<IEnumerable<ComplaintDto.ComplaintReadDto>>> GetComplaintsByCitizenPayload([FromBody] CitizenIdRequest request)
        {
            if (string.IsNullOrEmpty(request.CitizenId))
                return BadRequest("Invalid citizen ID");

            var complaints = await _service.GetComplaintsByCitizenAsync(request.CitizenId);
            return Ok(complaints);
        }

        [HttpGet("officer/{officerId}")]
         [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<IEnumerable<ComplaintDto.ComplaintReadDto>>> GetComplaintsByOfficer(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var complaints = await _service.GetComplaintsByOfficerAsync(officerId);
            return Ok(complaints);
        }

        [HttpPost("officer")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<IEnumerable<ComplaintDto.ComplaintReadDto>>> GetComplaintsByOfficerPayload([FromBody] OfficerIdRequest request)
        {
            if (string.IsNullOrEmpty(request.OfficerId))
                return BadRequest("Invalid officer ID");

            var complaints = await _service.GetComplaintsByOfficerAsync(request.OfficerId);
            return Ok(complaints);
        }

        [HttpGet]
         [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<IEnumerable<ComplaintDto.ComplaintReadDto>>> GetAllComplaints()
        {
            var complaints = await _service.GetAllComplaintsAsync();
            return Ok(complaints);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Officer")]
        public async Task<ActionResult<ComplaintDto.ComplaintReadDto>> UpdateComplaintStatus(int id, [FromForm] ComplaintDto.ComplaintUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.ComplaintId)
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

            var updated = await _service.UpdateComplaintStatusAsync(dto, officerImagePath);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpPut("status")]
        [Authorize(Roles = "Officer")]
        public async Task<ActionResult<ComplaintDto.ComplaintReadDto>> UpdateComplaintStatusPayload([FromForm] ComplaintDto.ComplaintUpdateDto dto)
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

            var updated = await _service.UpdateComplaintStatusAsync(dto, officerImagePath);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Citizen")]
        
        public async Task<ActionResult> DeleteComplaint(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid complaint ID");

            var deleted = await _service.DeleteComplaintAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}