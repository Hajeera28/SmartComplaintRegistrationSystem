using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   
    public class ComplaintAssignmentController : ControllerBase
    {
        private readonly ComplaintAssignmentService _service;

        public ComplaintAssignmentController(ComplaintAssignmentService service)
        {
            _service = service;
        }

        [HttpPost("assign")]
         [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ComplaintAssignmentDto.ComplaintAssignmentReadDto>> AssignComplaint([FromBody] ComplaintAssignmentDto.ComplaintAssignmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _service.AssignComplaintAsync(dto);
                return Ok(result);
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

        [HttpGet("complaint/{complaintId}")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>>> GetAssignmentsByComplaint(int complaintId)
        {
            if (complaintId <= 0)
                return BadRequest("Invalid complaint ID");

            var assignments = await _service.GetAssignmentsByComplaintAsync(complaintId);
            return Ok(assignments);
        }

        [HttpGet("officer/{officerId}")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>>> GetAssignmentsByOfficer(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var assignments = await _service.GetAssignmentsByOfficerAsync(officerId);
            return Ok(assignments);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]  
        public async Task<ActionResult<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>>> GetAllAssignments()
        {
            var assignments = await _service.GetAllAssignmentsAsync();
            return Ok(assignments);
        }

        [HttpDelete("unassign")]
        [Authorize(Roles = "Admin")]  
        public async Task<ActionResult> UnassignComplaint([FromQuery] int complaintId, [FromQuery] string officerId, [FromQuery] string deletedBy = "System")
        {
            if (complaintId <= 0 || string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid complaint ID or officer ID");

            var unassigned = await _service.UnassignComplaintAsync(complaintId, officerId, deletedBy);
            return unassigned ? NoContent() : NotFound();
        }
    }
}