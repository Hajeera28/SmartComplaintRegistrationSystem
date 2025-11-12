using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class ComplaintAssignmentRepository : IComplaintAssignment
    {
        private readonly ComplaintContext _context;

        public ComplaintAssignmentRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<ComplaintAssignment> CreateAsync(ComplaintAssignment assignment)
        {
            _context.ComplaintAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(assignment.ComplaintId, assignment.OfficerId) ?? assignment;
        }

        public async Task<ComplaintAssignment?> GetByIdAsync(int complaintId, string officerId)
        {
            return await _context.ComplaintAssignments
                .Include(ca => ca.Complaint)
                .Include(ca => ca.Officer)
                .FirstOrDefaultAsync(ca => ca.ComplaintId == complaintId && ca.OfficerId == officerId);
        }

        public async Task<IEnumerable<ComplaintAssignment>> GetByComplaintIdAsync(int complaintId)
        {
            return await _context.ComplaintAssignments
                .Include(ca => ca.Complaint)
                .Include(ca => ca.Officer)
                .Where(ca => ca.ComplaintId == complaintId)
                .OrderByDescending(ca => ca.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ComplaintAssignment>> GetByOfficerIdAsync(string officerId)
        {
            return await _context.ComplaintAssignments
                .Include(ca => ca.Complaint)
                .Include(ca => ca.Officer)
                .Where(ca => ca.OfficerId == officerId)
                .OrderByDescending(ca => ca.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ComplaintAssignment>> GetAllAsync()
        {
            return await _context.ComplaintAssignments
                .Include(ca => ca.Complaint)
                .Include(ca => ca.Officer)
                .OrderByDescending(ca => ca.AssignedDate)
                .ToListAsync();
        }

        public async Task<bool> SoftDeleteAsync(int complaintId, string officerId, string deletedBy)
        {
            var assignment = await _context.ComplaintAssignments
                .FirstOrDefaultAsync(ca => ca.ComplaintId == complaintId && ca.OfficerId == officerId);
            
            if (assignment == null) return false;

            assignment.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}