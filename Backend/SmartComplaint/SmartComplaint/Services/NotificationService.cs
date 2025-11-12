using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Services
{
    public class NotificationService
    {
        private readonly INotification _repository;

        public NotificationService(INotification repository)
        {
            _repository = repository;
        }

        public async Task<NotificationDto.NotificationReadDto> CreateNotificationAsync(NotificationDto.NotificationCreateDto dto)
        {
            var notification = new Notification
            {
                Message = dto.Message,
                OfficerId = dto.OfficerId,
                CitizenId = dto.CitizenId,
                ComplaintId = dto.ComplaintId,
                GrievanceId = dto.GrievanceId,
                CreatedAt = DateTime.Now,
                IsRead = false
            };

            var created = await _repository.CreateAsync(notification);
            return MapToReadDto(created);
        }

        public async Task<NotificationDto.NotificationReadDto?> GetNotificationByIdAsync(int id)
        {
            var notification = await _repository.GetByIdAsync(id);
            return notification == null ? null : MapToReadDto(notification);
        }

        public async Task<IEnumerable<NotificationDto.NotificationReadDto>> GetNotificationsByOfficerAsync(string officerId)
        {
            var notifications = await _repository.GetByOfficerIdAsync(officerId);
            return notifications.Select(MapToReadDto);
        }

        public async Task<IEnumerable<NotificationDto.NotificationReadDto>> GetUnreadNotificationsByOfficerAsync(string officerId)
        {
            var notifications = await _repository.GetUnreadByOfficerIdAsync(officerId);
            return notifications.Select(MapToReadDto);
        }

        public async Task<NotificationDto.NotificationReadDto?> MarkAsReadAsync(int id)
        {
            var notification = await _repository.MarkAsReadAsync(id);
            return notification == null ? null : MapToReadDto(notification);
        }

        public async Task<bool> MarkAllAsReadAsync(string officerId)
        {
            return await _repository.MarkAllAsReadAsync(officerId);
        }

        public async Task<IEnumerable<NotificationDto.NotificationReadDto>> GetAllNotificationsAsync()
        {
            var notifications = await _repository.GetAllAsync();
            return notifications.Select(MapToReadDto);
        }

        public async Task<bool> DeleteNotificationAsync(int id, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(id, deletedBy);
        }

        public async Task<IEnumerable<NotificationDto.NotificationReadDto>> GetNotificationsByCitizenAsync(string citizenId)
        {
            var notifications = await _repository.GetByCitizenIdAsync(citizenId);
            return notifications.Select(MapToReadDto);
        }

        public async Task<IEnumerable<NotificationDto.NotificationReadDto>> GetUnreadNotificationsByCitizenAsync(string citizenId)
        {
            var notifications = await _repository.GetUnreadByCitizenIdAsync(citizenId);
            return notifications.Select(MapToReadDto);
        }

        public async Task<bool> MarkAllAsReadByCitizenAsync(string citizenId)
        {
            return await _repository.MarkAllAsReadByCitizenAsync(citizenId);
        }

        private static NotificationDto.NotificationReadDto MapToReadDto(Notification notification)
        {
            return new NotificationDto.NotificationReadDto
            {
                NotificationId = notification.NotificationId,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                OfficerName = notification.Officer?.Name ?? "N/A",
                ComplaintId = notification.ComplaintId,
                ComplaintTitle = notification.Complaint?.Title,
                GrievanceId = notification.GrievanceId
            };
        }
    }
}