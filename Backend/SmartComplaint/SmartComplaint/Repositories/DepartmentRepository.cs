using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class DepartmentRepository : IDepartment
    {
        private readonly ComplaintContext _context;

        public DepartmentRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Department> CreateAsync(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(department.DepartmentId) ?? department;
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            return await _context.Departments
                .Include(d => d.Officers)
                .Include(d => d.Complaints)
                .FirstOrDefaultAsync(d => d.DepartmentId == id);
        }

        public async Task<Department?> GetByNameAsync(string name)
        {
            return await _context.Departments
                .Include(d => d.Officers)
                .Include(d => d.Complaints)
                .FirstOrDefaultAsync(d => d.DepartmentName == name);
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Departments
                .Include(d => d.Officers)
                .Include(d => d.Complaints)
                .OrderBy(d => d.DepartmentName)
                .ToListAsync();
        }

        public async Task<Department?> UpdateAsync(Department department)
        {
            var existing = await _context.Departments.FindAsync(department.DepartmentId);
            if (existing == null) return null;

            existing.DepartmentName = department.DepartmentName;
            existing.Description = department.Description;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(existing.DepartmentId);
        }

        public async Task<bool> SoftDeleteAsync(int id, string deletedBy)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return false;

            department.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}