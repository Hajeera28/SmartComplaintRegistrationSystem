using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface IComplaint
    {
        Task<Complaint> CreateAsync(Complaint complaint);
        Task<Complaint?> GetByIdAsync(int id);
        Task<IEnumerable<Complaint>> GetByCitizenIdAsync(string citizenId);
        Task<IEnumerable<Complaint>> GetByOfficerIdAsync(string officerId);
        Task<IEnumerable<Complaint>> GetAllAsync();
        Task<Complaint?> UpdateStatusAsync(int id, int statusId, string? remarks, string? officerImagePath = null);
        Task<bool> SoftDeleteAsync(int id);
    }
}
