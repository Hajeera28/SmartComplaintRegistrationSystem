using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class CitizenRepository : ICitizen
    {
        private readonly ComplaintContext _context;

        public CitizenRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Citizen> CreateAsync(Citizen citizen)
        {
            citizen.User = null;
            citizen.Complaints = null;
            citizen.Grievances = null;
            
            _context.Citizens.Add(citizen);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(citizen.CitizenId) ?? citizen;
        }

        public async Task<Citizen?> GetByIdAsync(string id)
        {
            return await _context.Citizens
                .Include(c => c.User)
                .Include(c => c.Complaints)
                .Include(c => c.Grievances)
                .FirstOrDefaultAsync(c => c.CitizenId == id);
        }

        public async Task<Citizen?> GetByUserIdAsync(int userId)
        {
            return await _context.Citizens
                .Include(c => c.User)
                .Include(c => c.Complaints)
                .Include(c => c.Grievances)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Citizen?> GetByEmailAsync(string email)
        {
            return await _context.Citizens
                .Include(c => c.User)
                .Include(c => c.Complaints)
                .Include(c => c.Grievances)
                .FirstOrDefaultAsync(c => c.Email == email);
        }

        public async Task<IEnumerable<Citizen>> GetAllAsync()
        {
            return await _context.Citizens
                .Include(c => c.User)
                .Include(c => c.Complaints)
                .Include(c => c.Grievances)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Citizen?> UpdateAsync(Citizen citizen)
        {
            var existing = await _context.Citizens.FindAsync(citizen.CitizenId);
            if (existing == null) return null;

            existing.Name = citizen.Name;
            existing.Email = citizen.Email;
            existing.Phone = citizen.Phone;
            existing.Address = citizen.Address;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(existing.CitizenId);
        }

        public async Task<bool> SoftDeleteAsync(string id)
        {
            var citizen = await _context.Citizens.FindAsync(id);
            if (citizen == null) return false;

            citizen.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}