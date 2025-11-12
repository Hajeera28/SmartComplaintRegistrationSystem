using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;

namespace SmartComplaint.Services
{
    public class DepartmentService
    {
        private readonly IDepartment _repository;

        public DepartmentService(IDepartment repository)
        {
            _repository = repository;
        }

        public async Task<DepartmentDto.DepartmentReadDto> CreateDepartmentAsync(DepartmentDto.DepartmentCreateDto dto)
        {
            var department = new Department
            {
                DepartmentName = dto.DepartmentName,
                Description = dto.Description
            };

            var created = await _repository.CreateAsync(department);
            return MapToReadDto(created);
        }

        public async Task<DepartmentDto.DepartmentReadDto?> GetDepartmentByIdAsync(int id)
        {
            var department = await _repository.GetByIdAsync(id);
            return department == null ? null : MapToReadDto(department);
        }

        public async Task<DepartmentDto.DepartmentReadDto?> GetDepartmentByNameAsync(string name)
        {
            var department = await _repository.GetByNameAsync(name);
            return department == null ? null : MapToReadDto(department);
        }

        public async Task<IEnumerable<DepartmentDto.DepartmentReadDto>> GetAllDepartmentsAsync()
        {
            var departments = await _repository.GetAllAsync();
            return departments.Select(MapToReadDto);
        }

        public async Task<DepartmentDto.DepartmentReadDto?> UpdateDepartmentAsync(DepartmentDto.DepartmentUpdateDto dto)
        {
            var department = new Department
            {
                DepartmentId = dto.DepartmentId,
                DepartmentName = dto.DepartmentName,
                Description = dto.Description
            };

            var updated = await _repository.UpdateAsync(department);
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> DeleteDepartmentAsync(int id, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(id, deletedBy);
        }

        private static DepartmentDto.DepartmentReadDto MapToReadDto(Department department)
        {
            return new DepartmentDto.DepartmentReadDto
            {
                DepartmentId = department.DepartmentId,
                DepartmentName = department.DepartmentName,
                Description = department.Description,
                OfficerCount = department.Officers?.Count ?? 0,
                ComplaintCount = department.Complaints?.Count ?? 0
            };
        }
    }
}