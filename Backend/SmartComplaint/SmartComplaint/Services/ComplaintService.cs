using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Data;
using Microsoft.EntityFrameworkCore;

namespace SmartComplaint.Services
{
    public class ComplaintService
    {
        private readonly IComplaint _repository;
        private readonly ComplaintContext _context;

        public ComplaintService(IComplaint repository, ComplaintContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<ComplaintDto.ComplaintReadDto> CreateComplaintAsync(ComplaintDto.ComplaintCreateDto dto, string? imagePath = null)
        {
            var complaint = new Complaint
            {
                Title = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                CitizenId = dto.CitizenId,
                DepartmentId = dto.DepartmentId,
                CategoryId = dto.CategoryId,
                ImagePath = imagePath,
                StatusId = 1 // Default: Pending
            };

            var created = await _repository.CreateAsync(complaint);
            return MapToReadDto(created);
        }

        public async Task<ComplaintDto.ComplaintReadDto?> GetComplaintByIdAsync(int id)
        {
            var complaint = await _repository.GetByIdAsync(id);
            return complaint == null ? null : MapToReadDto(complaint);
        }

        public async Task<IEnumerable<ComplaintDto.ComplaintReadDto>> GetComplaintsByCitizenAsync(string citizenId)
        {
            var complaints = await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive && c.CitizenId == citizenId)
                .Include(c => c.Department)
                .Include(c => c.Category)
                .Include(c => c.Status)
                .Include(c => c.Citizen)
                .Include(c => c.Grievances.Where(g => g.IsActive))
                .Include(c => c.ComplaintAssignments.Where(ca => ca.IsActive))
                .ThenInclude(ca => ca.Officer)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return complaints.Select(MapToReadDto);
        }

        public async Task<IEnumerable<ComplaintDto.ComplaintReadDto>> GetComplaintsByOfficerAsync(string officerId)
        {
            var complaints = await _repository.GetByOfficerIdAsync(officerId);
            return complaints.Select(MapToReadDto);
        }

        public async Task<IEnumerable<ComplaintDto.ComplaintReadDto>> GetAllComplaintsAsync()
        {
            var complaints = await _context.Complaints
                .IgnoreQueryFilters()
                .Where(c => c.IsActive)
                .Include(c => c.Department)
                .Include(c => c.Category)
                .Include(c => c.Status)
                .Include(c => c.Citizen)
                .Include(c => c.ComplaintAssignments.Where(ca => ca.IsActive))
                .ThenInclude(ca => ca.Officer)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return complaints.Select(MapToReadDto);
        }

        public async Task<ComplaintDto.ComplaintReadDto?> UpdateComplaintStatusAsync(ComplaintDto.ComplaintUpdateDto dto, string? officerImagePath = null, string? officerId = null)
        {
            // Validate officer is approved if officerId is provided
            if (!string.IsNullOrEmpty(officerId))
            {
                var officer = await _context.Officers.FindAsync(officerId);
                if (officer == null || !officer.IsApproved)
                    throw new InvalidOperationException("Only approved officers can update complaint status");
            }
            
            var updated = await _repository.UpdateStatusAsync(dto.ComplaintId, dto.StatusId, dto.OfficerRemarks, officerImagePath);
            
            // Create notification for citizen when status changes
            if (updated != null)
            {
                var statusName = GetComplaintStatusName(dto.StatusId);
                var message = $"Your complaint '{updated.Title}' status has been updated to {statusName}";
                
                var notification = new Notification
                {
                    Message = message,
                    CitizenId = updated.CitizenId,
                    ComplaintId = updated.ComplaintId,
                    CreatedAt = DateTime.Now,
                    IsRead = false,
                    IsActive = true
                };
                
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> DeleteComplaintAsync(int id)
        {
            return await _repository.SoftDeleteAsync(id);
        }

        private static string GetComplaintStatusName(int statusId)
        {
            return statusId switch
            {
                1 => "Pending",
                2 => "In Progress",
                3 => "Resolved",
                4 => "Closed",
                _ => "Unknown"
            };
        }

        private static ComplaintDto.ComplaintReadDto MapToReadDto(Complaint complaint)
        {
            var activeAssignment = complaint.ComplaintAssignments?.FirstOrDefault(ca => ca.IsActive);
            
            return new ComplaintDto.ComplaintReadDto
            {
                ComplaintId = complaint.ComplaintId,
                Title = complaint.Title,
                Description = complaint.Description,
                Location = complaint.Location,
                DepartmentName = complaint.Department?.DepartmentName ?? "N/A",
                CategoryName = complaint.Category?.CategoryName ?? "N/A",
                ComplaintStatus = complaint.Status?.StatusName ?? "Pending",
                CreatedAt = complaint.CreatedAt,
                UpdatedAt = complaint.UpdatedAt,
                OfficerRemarks = complaint.OfficerRemarks,
                ImagePath = complaint.ImagePath,
                OfficerImagePath = complaint.OfficerImagePath,
                AssignedOfficerId = activeAssignment?.OfficerId,
                HasGrievance = complaint.Grievances?.Any(g => g.IsActive) ?? false
            };
        }
    }
}