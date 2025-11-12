using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Repositories
{
    public class UserRepository : IUser
    {
        private readonly ComplaintContext _context;

        public UserRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<User> CreateAsync(User user)
        {
            // Clear navigation properties
            user.Citizen = null;
            user.Officer = null;
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(user.UserId) ?? user;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderBy(u => u.Username)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
        {
            return await _context.Users
                .Where(u => u.Role == role)
                .OrderBy(u => u.Username)
                .ToListAsync();
        }

        public async Task<User?> UpdateAsync(User user)
        {
            var existing = await _context.Users.FindAsync(user.UserId);
            if (existing == null) return null;

            existing.Username = user.Username;
            existing.Email = user.Email;
            existing.Role = user.Role;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(existing.UserId);
        }

        public async Task<bool> SoftDeleteAsync(int id, string deletedBy)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> ValidateLoginAsync(string email, string password)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.Password == password && u.IsActive);
        }
    }
}