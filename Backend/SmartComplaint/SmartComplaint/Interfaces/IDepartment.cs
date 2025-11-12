using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface IDepartment
    {
        Task<Department> CreateAsync(Department department);
        Task<Department?> GetByIdAsync(int id);
        Task<Department?> GetByNameAsync(string name);
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> UpdateAsync(Department department);
        Task<bool> SoftDeleteAsync(int id, string deletedBy);
    }
}