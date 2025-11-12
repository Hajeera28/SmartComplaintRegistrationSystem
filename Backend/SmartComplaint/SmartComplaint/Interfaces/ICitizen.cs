using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface ICitizen
    {
        Task<Citizen> CreateAsync(Citizen citizen);
        Task<Citizen?> GetByIdAsync(string id);
        Task<Citizen?> GetByUserIdAsync(int userId);
        Task<Citizen?> GetByEmailAsync(string email);
        Task<IEnumerable<Citizen>> GetAllAsync();
        Task<Citizen?> UpdateAsync(Citizen citizen);
        Task<bool> SoftDeleteAsync(string id);
    }
}