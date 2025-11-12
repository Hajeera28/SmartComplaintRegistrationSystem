using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Interfaces
{
    public interface IOfficer
    {
        Task<Officer> CreateAsync(Officer officer);
        Task<Officer?> GetByIdAsync(string id);
        Task<Officer?> GetByUserIdAsync(int userId);
        Task<Officer?> GetByEmailAsync(string email);
        Task<IEnumerable<Officer>> GetAllAsync();
        Task<IEnumerable<Officer>> GetByDepartmentIdAsync(int departmentId);
        Task<IEnumerable<Officer>> GetByRoleAsync(OfficerRole role);
        Task<Officer?> UpdateAsync(Officer officer);
        Task<bool> SoftDeleteAsync(string id, string deletedBy);
    }
}