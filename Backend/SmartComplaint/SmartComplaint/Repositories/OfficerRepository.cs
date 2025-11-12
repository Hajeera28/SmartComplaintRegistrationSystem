using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Repositories
{
    public class OfficerRepository : IOfficer
    {
        private readonly ComplaintContext _context;

        public OfficerRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Officer> CreateAsync(Officer officer)
        {
            // Clear navigation properties
            officer.User = null;
            officer.Department = null;
            officer.ComplaintAssignments = null;
            officer.OriginalGrievances = null;
            officer.AssignedGrievances = null;
            officer.Notifications = null;
            
            _context.Officers.Add(officer);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(officer.OfficerId) ?? officer;
        }

        public async Task<Officer?> GetByIdAsync(string id)
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .FirstOrDefaultAsync(o => o.OfficerId == id);
        }

        public async Task<Officer?> GetByUserIdAsync(int userId)
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .FirstOrDefaultAsync(o => o.UserId == userId);
        }

        public async Task<Officer?> GetByEmailAsync(string email)
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .FirstOrDefaultAsync(o => o.Email == email);
        }

        public async Task<IEnumerable<Officer>> GetAllAsync()
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .OrderBy(o => o.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Officer>> GetByDepartmentIdAsync(int departmentId)
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .Where(o => o.DepartmentId == departmentId)
                .OrderBy(o => o.Role)
                .ThenBy(o => o.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Officer>> GetByRoleAsync(OfficerRole role)
        {
            return await _context.Officers
                .Include(o => o.User)
                .Include(o => o.Department)
                .Include(o => o.ComplaintAssignments)
                .Include(o => o.AssignedGrievances)
                .Where(o => o.Role == role)
                .OrderBy(o => o.Name)
                .ToListAsync();
        }

        public async Task<Officer?> UpdateAsync(Officer officer)
        {
            var existing = await _context.Officers.FindAsync(officer.OfficerId);
            if (existing == null) return null;

            existing.Name = officer.Name;
            existing.Email = officer.Email;
            existing.Role = officer.Role;
            existing.DepartmentId = officer.DepartmentId;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(existing.OfficerId);
        }

        public async Task<bool> SoftDeleteAsync(string id, string deletedBy)
        {
            var officer = await _context.Officers.FindAsync(id);
            if (officer == null) return false;

            officer.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}