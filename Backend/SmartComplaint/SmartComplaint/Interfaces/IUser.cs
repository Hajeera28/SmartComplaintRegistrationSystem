using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Interfaces
{
    public interface IUser
    {
        Task<User> CreateAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetAllAsync();
        Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
        Task<User?> UpdateAsync(User user);
        Task<bool> SoftDeleteAsync(int id, string deletedBy);
        Task<User?> ValidateLoginAsync(string email, string password);
    }
}