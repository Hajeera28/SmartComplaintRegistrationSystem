using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Models;

namespace SmartComplaint.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly ComplaintContext _context;

        public DepartmentController(ComplaintContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments.ToListAsync();
            return Ok(departments);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostDepartment([FromBody] CreateDepartmentDto dto)
        {
            var department = new Department
            {
                DepartmentName = dto.DepartmentName,
                Description = dto.Description
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return Ok(new { 
                department.DepartmentId, 
                department.DepartmentName,
                department.Description
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound("Department not found");
            }

            // Check if department has categories
            var hasCategories = await _context.Categories.AnyAsync(c => c.DepartmentId == id);
            if (hasCategories)
            {
                return BadRequest("Cannot delete department with existing categories");
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok("Department deleted successfully");
        }
    }

    public class CreateDepartmentDto
    {
        public string DepartmentName { get; set; }
        public string? Description { get; set; }
    }
}