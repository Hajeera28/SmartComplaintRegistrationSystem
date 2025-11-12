using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Models;

namespace SmartComplaint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ComplaintContext _context;

        public CategoryController(ComplaintContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Department)
                .Where(c => c.IsActive)
                .Select(c => new { 
                    c.CategoryId, 
                    c.CategoryName, 
                    c.DepartmentId,
                    DepartmentName = c.Department.DepartmentName
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("department/{departmentId}")]
        [Authorize(Roles = "Admin,Citizen,Officer")]  
        public async Task<IActionResult> GetCategoriesByDepartment(int departmentId)
        {
            var categories = await _context.Categories
                .Where(c => c.DepartmentId == departmentId && c.IsActive)
                .Select(c => new { c.CategoryId, c.CategoryName })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            var category = new Category
            {
                CategoryName = dto.CategoryName,
                DepartmentId = dto.DepartmentId,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { 
                category.CategoryId, 
                category.CategoryName, 
                category.DepartmentId 
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            category.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateCategoryDto
    {
        public string CategoryName { get; set; }
        public int DepartmentId { get; set; }
    }
}