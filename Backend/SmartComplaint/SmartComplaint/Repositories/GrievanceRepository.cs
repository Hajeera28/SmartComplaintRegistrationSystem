using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class GrievanceRepository : IGrievance
    {
        private readonly ComplaintContext _context;

        public GrievanceRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Grievance> CreateAsync(Grievance grievance)
        {
            // Clear navigation properties
            grievance.Complaint = null;
            grievance.Citizen = null;
            grievance.OriginalOfficer = null;
            grievance.AssignedOfficer = null;
            grievance.Notifications = null;
            
            _context.Grievances.Add(grievance);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(grievance.GrievanceId) ?? grievance;
        }

        public async Task<Grievance?> GetByIdAsync(int id)
        {
            return await _context.Grievances
                .IgnoreQueryFilters()
                .Where(g => g.IsActive)
                .Include(g => g.Complaint)
                .Include(g => g.Citizen)
                .Include(g => g.OriginalOfficer)
                .Include(g => g.AssignedOfficer)
                .Include(g => g.Status)
                .FirstOrDefaultAsync(g => g.GrievanceId == id);
        }

        public async Task<IEnumerable<Grievance>> GetByCitizenIdAsync(string citizenId)
        {
            return await _context.Grievances
                .IgnoreQueryFilters()
                .Where(g => g.IsActive && g.CitizenId == citizenId)
                .Include(g => g.Complaint)
                .Include(g => g.OriginalOfficer)
                .Include(g => g.AssignedOfficer)
                .Include(g => g.Status)
                .OrderByDescending(g => g.RaisedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grievance>> GetByOfficerIdAsync(string officerId)
        {
            return await _context.Grievances
                .IgnoreQueryFilters()
                .Where(g => g.IsActive && g.AssignedOfficerId == officerId)
                .Include(g => g.Complaint)
                .Include(g => g.Citizen)
                .Include(g => g.OriginalOfficer)
                .Include(g => g.AssignedOfficer)
                .Include(g => g.Status)
                .OrderByDescending(g => g.RaisedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grievance>> GetAllAsync()
        {
            return await _context.Grievances
                .IgnoreQueryFilters()
                .Where(g => g.IsActive)
                .Include(g => g.Complaint)
                .Include(g => g.Citizen)
                .Include(g => g.OriginalOfficer)
                .Include(g => g.AssignedOfficer)
                .Include(g => g.Status)
                .OrderByDescending(g => g.RaisedDate)
                .ToListAsync();
        }

        public async Task<Grievance?> UpdateResponseAsync(int id, string? response)
        {
            var grievance = await GetByIdAsync(id);
            if (grievance == null) return null;

            grievance.Response = response;
            grievance.ResponseDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return grievance;
        }

        public async Task<Grievance?> UpdateStatusAsync(int id, int statusId, string? remarks, string? officerImagePath = null)
        {
            var grievance = await GetByIdAsync(id);
            if (grievance == null) return null;

            grievance.StatusId = statusId;
            grievance.OfficerRemarks = remarks;
            grievance.OfficerImagePath = officerImagePath;
            grievance.ResponseDate = DateTime.Now;

            await _context.SaveChangesAsync();
            
            // Return updated grievance with all includes
            return await GetByIdAsync(id);
        }

        public async Task<bool> SoftDeleteAsync(int id, string deletedBy)
        {
            var grievance = await _context.Grievances.FindAsync(id);
            if (grievance == null) return false;

            grievance.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}