using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Services
{
    public class OfficerService
    {
        private readonly IOfficer _repository;
        private readonly IUser _userRepository;

        public OfficerService(IOfficer repository, IUser userRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
        }

        public async Task<OfficerDto.OfficerReadDto> CreateOfficerAsync(OfficerDto.OfficerCreateDto dto, string? proofDocumentPath = null)
        {
            // Check if email already exists
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already exists");

            // First create User
            var user = new User
            {
                Username = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = UserRole.Officer
            };
            
            var createdUser = await _userRepository.CreateAsync(user);
            
            // Generate OfficerId based on role
            string rolePrefix = dto.Role switch
            {
                OfficerRole.FieldOfficer => "OFFFO",
                OfficerRole.SeniorOfficer => "OFFSO",
                _ => "OFFFO"
            };
            
            var officerId = $"{rolePrefix}{createdUser.UserId:D3}";
            
            // Then create Officer with the UserId (pending approval)
            var officer = new Officer
            {
                OfficerId = officerId,
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                DepartmentId = dto.DepartmentId,
                State = "TN", // Default state, can be made configurable
                UserId = createdUser.UserId,
                IsApproved = false,
                ProofDocumentPath = proofDocumentPath
            };

            var created = await _repository.CreateAsync(officer);
            return MapToReadDto(created);
        }

        public async Task<OfficerDto.OfficerReadDto?> GetOfficerByIdAsync(string id)
        {
            var officer = await _repository.GetByIdAsync(id);
            return officer == null ? null : MapToReadDto(officer);
        }

        public async Task<OfficerDto.OfficerReadDto?> GetOfficerByUserIdAsync(int userId)
        {
            var officer = await _repository.GetByUserIdAsync(userId);
            return officer == null ? null : MapToReadDto(officer);
        }

        public async Task<OfficerDto.OfficerReadDto?> GetOfficerByEmailAsync(string email)
        {
            var officer = await _repository.GetByEmailAsync(email);
            return officer == null ? null : MapToReadDto(officer);
        }

        public async Task<IEnumerable<OfficerDto.OfficerReadDto>> GetAllOfficersAsync()
        {
            var officers = await _repository.GetAllAsync();
            return officers.Select(MapToReadDto);
        }

        public async Task<IEnumerable<OfficerDto.OfficerReadDto>> GetOfficersByDepartmentAsync(int departmentId)
        {
            var officers = await _repository.GetByDepartmentIdAsync(departmentId);
            return officers.Select(MapToReadDto);
        }

        public async Task<IEnumerable<OfficerDto.OfficerReadDto>> GetOfficersByRoleAsync(OfficerRole role)
        {
            var officers = await _repository.GetByRoleAsync(role);
            return officers.Select(MapToReadDto);
        }

        public async Task<OfficerDto.OfficerReadDto?> UpdateOfficerAsync(OfficerDto.OfficerUpdateDto dto)
        {
            // Get existing officer to find UserId
            var existingOfficer = await _repository.GetByIdAsync(dto.OfficerId);
            if (existingOfficer == null) return null;

            // Update User table
            var existingUser = await _userRepository.GetByIdAsync(existingOfficer.UserId);
            if (existingUser != null)
            {
                var userToUpdate = new User
                {
                    UserId = existingUser.UserId,
                    Username = dto.Name,
                    Email = dto.Email,
                    Role = existingUser.Role
                };
                await _userRepository.UpdateAsync(userToUpdate);
            }

            // Update Officer table
            var officer = new Officer
            {
                OfficerId = dto.OfficerId,
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                DepartmentId = dto.DepartmentId
            };

            var updated = await _repository.UpdateAsync(officer);
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> DeleteOfficerAsync(string id, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(id, deletedBy);
        }

        public async Task<bool> ApproveOfficerAsync(string officerId)
        {
            var officer = await _repository.GetByIdAsync(officerId);
            if (officer == null) return false;
            
            officer.IsApproved = true;
            await _repository.UpdateAsync(officer);
            return true;
        }

        public async Task<bool> DenyOfficerAsync(string officerId)
        {
            return await _repository.SoftDeleteAsync(officerId, "Admin");
        }

        public async Task<IEnumerable<OfficerDto.OfficerReadDto>> GetPendingOfficersAsync()
        {
            var officers = await _repository.GetAllAsync();
            return officers.Where(o => !o.IsApproved).Select(MapToReadDto);
        }

        private static OfficerDto.OfficerReadDto MapToReadDto(Officer officer)
        {
            return new OfficerDto.OfficerReadDto
            {
                OfficerId = officer.OfficerId,
                Name = officer.Name,
                Email = officer.Email,
                Role = officer.Role.ToString(),
                DepartmentName = officer.Department?.DepartmentName ?? "N/A",
                Username = officer.User?.Username ?? "N/A",
                AssignedComplaintCount = officer.ComplaintAssignments?.Count ?? 0,
                AssignedGrievanceCount = officer.AssignedGrievances?.Count ?? 0,
                IsApproved = officer.IsApproved,
                ProofDocumentPath = officer.ProofDocumentPath
            };
        }
    }
}