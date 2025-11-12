using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Services;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _service;

        public NotificationController(NotificationService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<NotificationDto.NotificationReadDto>> CreateNotification([FromBody] NotificationDto.NotificationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _service.CreateNotificationAsync(dto);
                return CreatedAtAction(nameof(GetNotificationById), new { id = result.NotificationId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult<NotificationDto.NotificationReadDto>> GetNotificationById(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid notification ID");

            var notification = await _service.GetNotificationByIdAsync(id);
            return notification == null ? NotFound() : Ok(notification);
        }

        [HttpGet("officer/{officerId}")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<NotificationDto.NotificationReadDto>>> GetNotificationsByOfficer(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var notifications = await _service.GetNotificationsByOfficerAsync(officerId);
            return Ok(notifications);
        }

        [HttpGet("officer/{officerId}/unread")]
        [Authorize(Roles = "Admin,Officer")]  
        public async Task<ActionResult<IEnumerable<NotificationDto.NotificationReadDto>>> GetUnreadNotificationsByOfficer(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var notifications = await _service.GetUnreadNotificationsByOfficerAsync(officerId);
            return Ok(notifications);
        }

        [HttpGet("citizen/{citizenId}")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult<IEnumerable<NotificationDto.NotificationReadDto>>> GetNotificationsByCitizen(string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Invalid citizen ID");

            var notifications = await _service.GetNotificationsByCitizenAsync(citizenId);
            return Ok(notifications);
        }

        [HttpGet("citizen/{citizenId}/unread")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult<IEnumerable<NotificationDto.NotificationReadDto>>> GetUnreadNotificationsByCitizen(string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Invalid citizen ID");

            var notifications = await _service.GetUnreadNotificationsByCitizenAsync(citizenId);
            return Ok(notifications);
        }

        [HttpPut("citizen/{citizenId}/read-all")]
        [Authorize(Roles = "Admin,Citizen")]  
        public async Task<ActionResult> MarkAllAsReadByCitizen(string citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return BadRequest("Invalid citizen ID");

            var marked = await _service.MarkAllAsReadByCitizenAsync(citizenId);
            return marked ? Ok("All notifications marked as read") : NotFound("No unread notifications found");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Officer,Citizen")]  
        public async Task<ActionResult<IEnumerable<NotificationDto.NotificationReadDto>>> GetAllNotifications()
        {
            var notifications = await _service.GetAllNotificationsAsync();
            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        [Authorize(Roles = "Citizen,Officer")]  
        public async Task<ActionResult<NotificationDto.NotificationReadDto>> MarkAsRead(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid notification ID");

            var notification = await _service.MarkAsReadAsync(id);
            return notification == null ? NotFound() : Ok(notification);
        }

        [HttpPut("officer/{officerId}/read-all")]
         [Authorize(Roles = "Citizen,Officer")]  
        public async Task<ActionResult> MarkAllAsRead(string officerId)
        {
            if (string.IsNullOrEmpty(officerId))
                return BadRequest("Invalid officer ID");

            var marked = await _service.MarkAllAsReadAsync(officerId);
            return marked ? Ok("All notifications marked as read") : NotFound("No unread notifications found");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<ActionResult> DeleteNotification(int id, [FromQuery] string deletedBy = "System")
        {
            if (id <= 0)
                return BadRequest("Invalid notification ID");

            var deleted = await _service.DeleteNotificationAsync(id, deletedBy);
            return deleted ? NoContent() : NotFound();
        }
    }
}