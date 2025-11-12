using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface IGrievance
    {
        Task<Grievance> CreateAsync(Grievance grievance);
        Task<Grievance?> GetByIdAsync(int id);
        Task<IEnumerable<Grievance>> GetByCitizenIdAsync(string citizenId);
        Task<IEnumerable<Grievance>> GetByOfficerIdAsync(string officerId);
        Task<Grievance?> UpdateResponseAsync(int id, string? response);
        Task<Grievance?> UpdateStatusAsync(int id, int statusId, string? remarks, string? officerImagePath = null);
        Task<IEnumerable<Grievance>> GetAllAsync();
        Task<bool> SoftDeleteAsync(int id, string deletedBy);
    }
}