using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class ComplaintRepository : IComplaint
    {
        private readonly ComplaintContext _context;

        public ComplaintRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Complaint> CreateAsync(Complaint complaint)
        {
            // Clear navigation properties to avoid EF issues
            complaint.Citizen = null;
            complaint.Department = null;
            complaint.Status = null;
            complaint.ComplaintAssignments = null;
            complaint.Grievances = null;
            complaint.Notifications = null;
            
            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(complaint.ComplaintId) ?? complaint;
        }

        public async Task<Complaint?> GetByIdAsync(int id)
        {
            return await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive)
                .Include(c => c.Department)
                .Include(c => c.Category)
                .Include(c => c.Status)
                .Include(c => c.Citizen)
                .FirstOrDefaultAsync(c => c.ComplaintId == id);
        }

        public async Task<IEnumerable<Complaint>> GetByCitizenIdAsync(string citizenId)
        {
            return await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive && c.CitizenId == citizenId)
                .Include(c => c.Department)
                .Include(c => c.Status)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Complaint>> GetByOfficerIdAsync(string officerId)
        {
            return await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive)
                .Include(c => c.Department)
                .Include(c => c.Category)
                .Include(c => c.Status)
                .Include(c => c.Citizen)
                .Include(c => c.ComplaintAssignments.Where(ca => ca.IsActive))
                .Where(c => c.ComplaintAssignments.Any(ca => ca.OfficerId == officerId && ca.IsActive))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Complaint>> GetAllAsync()
        {
            return await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive)
                .Include(c => c.Department)
                .Include(c => c.Category)
                .Include(c => c.Status)
                .Include(c => c.Citizen)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Complaint?> UpdateStatusAsync(int id, int statusId, string? remarks, string? officerImagePath = null)
        {
            var complaint = await GetByIdAsync(id);
            if (complaint == null) return null;

            complaint.StatusId = statusId;
            complaint.OfficerRemarks = remarks;
            complaint.OfficerImagePath = officerImagePath;
            complaint.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return complaint;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var complaint = await _context.Complaints.FindAsync(id);
            if (complaint == null) return false;

            complaint.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}