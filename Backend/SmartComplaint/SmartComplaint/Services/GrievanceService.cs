using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Services
{
    public class GrievanceService
    {
        private readonly IGrievance _repository;
        private readonly ComplaintContext _context;
        private readonly INotification _notificationRepository;

        public GrievanceService(IGrievance repository, ComplaintContext context, INotification notificationRepository)
        {
            _repository = repository;
            _context = context;
            _notificationRepository = notificationRepository;
        }

        public async Task<GrievanceDto.GrievanceReadDto> CreateGrievanceAsync(GrievanceDto.GrievanceCreateDto dto, string? imagePath = null)
        {
            // Validate complaint exists and is resolved/closed
            var complaint = await _context.Complaints
                .Include(c => c.ComplaintAssignments)
                .ThenInclude(ca => ca.Officer)
                .FirstOrDefaultAsync(c => c.ComplaintId == dto.ComplaintId);

            if (complaint == null)
                throw new ArgumentException("Complaint not found");

            if (complaint.StatusId != 3 && complaint.StatusId != 4)
                throw new InvalidOperationException("Grievance can only be raised against resolved or closed complaints");

            // Get original officer
            var originalOfficer = complaint.ComplaintAssignments?.FirstOrDefault()?.Officer;
            if (originalOfficer == null)
                throw new InvalidOperationException("No officer found for this complaint");

            // Find higher-level officer
            var higherOfficer = await FindHigherOfficerAsync(originalOfficer);
            if (higherOfficer == null)
                throw new InvalidOperationException("No higher-level officer available for escalation");

            var grievance = new Grievance
            {
                ComplaintId = dto.ComplaintId,
                CitizenId = dto.CitizenId,
                Description = dto.Description,
                ImagePath = imagePath,
                OriginalOfficerId = originalOfficer.OfficerId,
                AssignedOfficerId = higherOfficer.OfficerId,

            };

            var created = await _repository.CreateAsync(grievance);
            
            // Create notifications for both original and assigned officers
            var originalNotification = new Notification
            {
                Message = $"Grievance raised for complaint: {complaint.Title}",
                OfficerId = originalOfficer.OfficerId,
                GrievanceId = created.GrievanceId,
                CreatedAt = DateTime.Now,
                IsRead = false
            };
            
            var assignedNotification = new Notification
            {
                Message = $"New grievance assigned: {complaint.Title}",
                OfficerId = higherOfficer.OfficerId,
                GrievanceId = created.GrievanceId,
                CreatedAt = DateTime.Now,
                IsRead = false
            };
            
            await _notificationRepository.CreateAsync(originalNotification);
            await _notificationRepository.CreateAsync(assignedNotification);
            
            return MapToReadDto(created);
        }

        public async Task<GrievanceDto.GrievanceReadDto?> GetGrievanceByIdAsync(int id)
        {
            var grievance = await _repository.GetByIdAsync(id);
            return grievance == null ? null : MapToReadDto(grievance);
        }

        public async Task<IEnumerable<GrievanceDto.GrievanceReadDto>> GetGrievancesByCitizenAsync(string citizenId)
        {
            var grievances = await _repository.GetByCitizenIdAsync(citizenId);
            return grievances.Select(MapToReadDto);
        }

        public async Task<IEnumerable<GrievanceDto.GrievanceReadDto>> GetGrievancesByOfficerAsync(string officerId)
        {
            var grievances = await _repository.GetByOfficerIdAsync(officerId);
            return grievances.Select(MapToReadDto);
        }

        public async Task<IEnumerable<GrievanceDto.GrievanceReadDto>> GetAllGrievancesAsync()
        {
            var grievances = await _repository.GetAllAsync();
            return grievances.Select(MapToReadDto);
        }

        public async Task<GrievanceDto.GrievanceReadDto?> UpdateGrievanceResponseAsync(GrievanceDto.GrievanceUpdateDto dto)
        {
            var updated = await _repository.UpdateResponseAsync(dto.GrievanceId, dto.Response);
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<GrievanceDto.GrievanceReadDto?> UpdateGrievanceStatusAsync(GrievanceDto.GrievanceStatusUpdateDto dto, string? officerImagePath = null, string? officerId = null)
        {
            // Validate officer is approved if officerId is provided
            if (!string.IsNullOrEmpty(officerId))
            {
                var officer = await _context.Officers.FindAsync(officerId);
                if (officer == null || !officer.IsApproved)
                    throw new InvalidOperationException("Only approved officers can update grievance status");
            }
            
            var updated = await _repository.UpdateStatusAsync(dto.GrievanceId, dto.StatusId, dto.OfficerRemarks, officerImagePath);
            
            if (updated != null)
            {
                // Create notification for citizen about grievance status update
                var statusName = GetStatusName(dto.StatusId);
                var citizenNotification = new Notification
                {
                    Message = $"Your grievance status has been updated to {statusName}",
                    CitizenId = updated.CitizenId,
                    GrievanceId = updated.GrievanceId,
                    CreatedAt = DateTime.Now,
                    IsRead = false,
                    IsActive = true
                };
                
                _context.Notifications.Add(citizenNotification);
                await _context.SaveChangesAsync();
                
                // Reload the grievance to ensure we have the latest data with status
                updated = await _repository.GetByIdAsync(dto.GrievanceId);
            }
            
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> CheckGrievanceExistsAsync(int complaintId)
        {
            var grievance = await _context.Grievances
                .FirstOrDefaultAsync(g => g.ComplaintId == complaintId && g.IsActive);
            return grievance != null;
        }

        public async Task<bool> DeleteGrievanceAsync(int id, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(id, deletedBy);
        }

        private async Task<Officer?> FindHigherOfficerAsync(Officer originalOfficer)
        {
            var higherRole = GetNextHigherRole(originalOfficer.Role);
            
            var higherOfficer = await _context.Officers
                .Where(o => o.DepartmentId == originalOfficer.DepartmentId && 
                           o.Role == higherRole && 
                           o.IsActive && 
                           o.IsApproved)
                .FirstOrDefaultAsync();

            if (higherOfficer == null)
            {
                higherOfficer = await _context.Officers
                    .Where(o => o.Role == OfficerRole.Commissioner && o.IsActive && o.IsApproved)
                    .FirstOrDefaultAsync();
            }

            return higherOfficer;
        }

        private static OfficerRole GetNextHigherRole(OfficerRole currentRole)
        {
            return currentRole switch
            {
                OfficerRole.FieldOfficer => OfficerRole.SeniorOfficer,
                OfficerRole.SeniorOfficer => OfficerRole.DepartmentHead,
                OfficerRole.DepartmentHead => OfficerRole.RegionalHead,
                OfficerRole.RegionalHead => OfficerRole.Commissioner,
                _ => OfficerRole.Commissioner
            };
        }

        private static string GetStatusName(int statusId)
        {
            return statusId switch
            {
                1 => "Pending",
                2 => "Under Review",
                3 => "Resolved",
                4 => "Rejected",
                _ => "Unknown"
            };
        }

        private static GrievanceDto.GrievanceReadDto MapToReadDto(Grievance grievance)
        {
            return new GrievanceDto.GrievanceReadDto
            {
                GrievanceId = grievance.GrievanceId,
                Description = grievance.Description,
                RaisedDate = grievance.RaisedDate,
                Response = grievance.Response,
                ResponseDate = grievance.ResponseDate,
                ComplaintTitle = grievance.Complaint?.Title ?? "N/A",
                OriginalOfficerName = grievance.OriginalOfficer?.Name ?? "N/A",
                AssignedOfficerName = grievance.AssignedOfficer?.Name ?? "N/A",
                GrievanceStatus = grievance.Status?.StatusName ?? "Pending",
                OfficerRemarks = grievance.OfficerRemarks,
                ImagePath = grievance.ImagePath,
                OfficerImagePath = grievance.OfficerImagePath,
                CitizenName = grievance.Citizen?.Name ?? "N/A",
                ComplaintId = grievance.ComplaintId
            };
        }
    }
}