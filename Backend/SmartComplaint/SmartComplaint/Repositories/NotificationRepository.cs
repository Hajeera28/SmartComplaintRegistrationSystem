using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Repositories
{
    public class NotificationRepository : INotification
    {
        private readonly ComplaintContext _context;

        public NotificationRepository(ComplaintContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateAsync(Notification notification)
        {
            // Clear navigation properties to avoid EF issues
            notification.Officer = null;
            notification.Citizen = null;
            notification.Complaint = null;
            notification.Grievance = null;
            
            // Ensure IsActive is set to true
            notification.IsActive = true;
            
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(notification.NotificationId) ?? notification;
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .FirstOrDefaultAsync(n => n.NotificationId == id);
        }

        public async Task<IEnumerable<Notification>> GetByOfficerIdAsync(string officerId)
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.OfficerId == officerId)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetByCitizenIdAsync(string citizenId)
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.CitizenId == citizenId)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadByOfficerIdAsync(string officerId)
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.OfficerId == officerId && !n.IsRead)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadByCitizenIdAsync(string citizenId)
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.CitizenId == citizenId && !n.IsRead)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification?> MarkAsReadAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return null;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> MarkAllAsReadAsync(string officerId)
        {
            var notifications = await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.OfficerId == officerId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any()) return false;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllAsReadByCitizenAsync(string citizenId)
        {
            var notifications = await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive && n.CitizenId == citizenId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any()) return false;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Notification>> GetAllAsync()
        {
            return await _context.Notifications
                .IgnoreQueryFilters()
                .Where(n => n.IsActive)
                .Include(n => n.Officer)
                .Include(n => n.Citizen)
                .Include(n => n.Complaint)
                .Include(n => n.Grievance)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> SoftDeleteAsync(int id, string deletedBy)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return false;

            notification.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}