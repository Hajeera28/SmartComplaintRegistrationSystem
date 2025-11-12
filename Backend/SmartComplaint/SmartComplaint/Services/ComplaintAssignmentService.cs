using Microsoft.EntityFrameworkCore;
using SmartComplaint.Data;
using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Services
{
    public class ComplaintAssignmentService
    {
        private readonly IComplaintAssignment _repository;
        private readonly ComplaintContext _context;

        public ComplaintAssignmentService(IComplaintAssignment repository, ComplaintContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<ComplaintAssignmentDto.ComplaintAssignmentReadDto> AssignComplaintAsync(ComplaintAssignmentDto.ComplaintAssignmentCreateDto dto)
        {
            // Validate complaint exists
            var complaint = await _context.Complaints.FindAsync(dto.ComplaintId);
            if (complaint == null)
                throw new ArgumentException("Complaint not found");

            // Validate officer exists and is approved
            var officer = await _context.Officers.FindAsync(dto.OfficerId);
            if (officer == null)
                throw new ArgumentException("Officer not found");
            
            if (!officer.IsApproved)
                throw new InvalidOperationException("Only approved officers can be assigned complaints");

            // Check if already assigned
            var existingAssignment = await _context.ComplaintAssignments
                .FirstOrDefaultAsync(ca => ca.ComplaintId == dto.ComplaintId && ca.OfficerId == dto.OfficerId);
            
            if (existingAssignment != null)
                throw new InvalidOperationException("Complaint already assigned to this officer");

            var assignment = new ComplaintAssignment
            {
                ComplaintId = dto.ComplaintId,
                OfficerId = dto.OfficerId,
                AssignedDate = DateTime.Now,
                Remarks = dto.Remarks
            };

            var created = await _repository.CreateAsync(assignment);

            // Create notification for officer
            var notification = new Notification
            {
                Message = $"New complaint assigned: {complaint.Title}",
                OfficerId = dto.OfficerId,
                ComplaintId = dto.ComplaintId,
                CreatedAt = DateTime.Now,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return MapToReadDto(created);
        }

        public async Task<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>> GetAssignmentsByComplaintAsync(int complaintId)
        {
            var assignments = await _repository.GetByComplaintIdAsync(complaintId);
            return assignments.Select(MapToReadDto);
        }

        public async Task<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>> GetAssignmentsByOfficerAsync(string officerId)
        {
            var assignments = await _repository.GetByOfficerIdAsync(officerId);
            return assignments.Select(MapToReadDto);
        }

        public async Task<IEnumerable<ComplaintAssignmentDto.ComplaintAssignmentReadDto>> GetAllAssignmentsAsync()
        {
            var assignments = await _repository.GetAllAsync();
            return assignments.Select(MapToReadDto);
        }

        public async Task<bool> UnassignComplaintAsync(int complaintId, string officerId, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(complaintId, officerId, deletedBy);
        }

        private static ComplaintAssignmentDto.ComplaintAssignmentReadDto MapToReadDto(ComplaintAssignment assignment)
        {
            return new ComplaintAssignmentDto.ComplaintAssignmentReadDto
            {
                ComplaintId = assignment.ComplaintId,
                OfficerId = assignment.OfficerId,
                ComplaintTitle = assignment.Complaint?.Title ?? "N/A",
                OfficerName = assignment.Officer?.Name ?? "N/A",

                AssignedDate = assignment.AssignedDate,
                Remarks = assignment.Remarks
            };
        }
    }
}