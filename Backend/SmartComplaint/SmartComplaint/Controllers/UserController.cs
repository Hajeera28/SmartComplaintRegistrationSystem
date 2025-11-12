using Microsoft.AspNetCore.Mvc;
using SmartComplaint.DTOs;
using SmartComplaint.Models.Enums;
using SmartComplaint.Services;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _service;

        public UserController(UserService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<UserDto.UserReadDto>> CreateUser([FromBody] UserDto.UserCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(UserRole), dto.Role))
                return BadRequest("Invalid user role");

            try
            {
                var result = await _service.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUserById), new { id = result.UserId }, result);
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
        public async Task<ActionResult<UserDto.UserReadDto>> GetUserById(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid user ID");

            var user = await _service.GetUserByIdAsync(id);
            return user == null ? NotFound() : Ok(user);
        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto.UserReadDto>>> GetAllUsers()
        {
            var users = await _service.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto.UserReadDto>> UpdateUser(int id, [FromBody] UserDto.UserUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.UserId)
                return BadRequest("ID mismatch");

            if (!Enum.IsDefined(typeof(UserRole), dto.Role))
                return BadRequest("Invalid user role");

            var updated = await _service.UpdateUserAsync(dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id, [FromQuery] string deletedBy = "System")
        {
            if (id <= 0)
                return BadRequest("Invalid user ID");

            var deleted = await _service.DeleteUserAsync(id, deletedBy);
            return deleted ? NoContent() : NotFound();
        }
    }
}