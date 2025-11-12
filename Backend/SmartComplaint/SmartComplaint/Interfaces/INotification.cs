using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface INotification
    {
        Task<Notification> CreateAsync(Notification notification);
        Task<Notification?> GetByIdAsync(int id);
        Task<IEnumerable<Notification>> GetByOfficerIdAsync(string officerId);
        Task<IEnumerable<Notification>> GetUnreadByOfficerIdAsync(string officerId);
        Task<IEnumerable<Notification>> GetByCitizenIdAsync(string citizenId);
        Task<IEnumerable<Notification>> GetUnreadByCitizenIdAsync(string citizenId);
        Task<Notification?> MarkAsReadAsync(int id);
        Task<bool> MarkAllAsReadAsync(string officerId);
        Task<bool> MarkAllAsReadByCitizenAsync(string citizenId);
        Task<IEnumerable<Notification>> GetAllAsync();
        Task<bool> SoftDeleteAsync(int id, string deletedBy);
    }
}