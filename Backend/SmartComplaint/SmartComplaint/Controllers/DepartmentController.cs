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
                DepartmentName = dto.DepartmentName
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return Ok(new { 
                department.DepartmentId, 
                department.DepartmentName 
            });
        }
    }

    public class CreateDepartmentDto
    {
        public string DepartmentName { get; set; }
    }
}