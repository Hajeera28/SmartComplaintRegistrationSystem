using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface IComplaintAssignment
    {
        Task<ComplaintAssignment> CreateAsync(ComplaintAssignment assignment);
        Task<ComplaintAssignment?> GetByIdAsync(int complaintId, string officerId);
        Task<IEnumerable<ComplaintAssignment>> GetByComplaintIdAsync(int complaintId);
        Task<IEnumerable<ComplaintAssignment>> GetByOfficerIdAsync(string officerId);
        Task<IEnumerable<ComplaintAssignment>> GetAllAsync();
        Task<bool> SoftDeleteAsync(int complaintId, string officerId, string deletedBy);
    }
}