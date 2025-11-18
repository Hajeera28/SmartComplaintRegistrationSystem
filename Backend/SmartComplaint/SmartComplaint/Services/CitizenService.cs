using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Services
{
    public class CitizenService
    {
        private readonly ICitizen _repository;
        private readonly IUser _userRepository;

        public CitizenService(ICitizen repository, IUser userRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
        }

        public async Task<CitizenDto.CitizenReadDto> CreateCitizenAsync(CitizenDto.CitizenCreateDto dto)
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
                Role = UserRole.Citizen
            };
            
            var createdUser = await _userRepository.CreateAsync(user);
            
            // Then create Citizen with the UserId
            var citizen = new Citizen
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                District = dto.District,
                State = "Tamil Nadu",
                UserId = createdUser.UserId
            };

            var created = await _repository.CreateAsync(citizen);
            return MapToReadDto(created);
        }

        public async Task<CitizenDto.CitizenReadDto?> GetCitizenByIdAsync(string id)
        {
            var citizen = await _repository.GetByIdAsync(id);
            return citizen == null ? null : MapToReadDto(citizen);
        }

        public async Task<CitizenDto.CitizenReadDto?> GetCitizenByUserIdAsync(int userId)
        {
            var citizen = await _repository.GetByUserIdAsync(userId);
            return citizen == null ? null : MapToReadDto(citizen);
        }

        public async Task<CitizenDto.CitizenReadDto?> GetCitizenByEmailAsync(string email)
        {
            var citizen = await _repository.GetByEmailAsync(email);
            return citizen == null ? null : MapToReadDto(citizen);
        }

        public async Task<IEnumerable<CitizenDto.CitizenReadDto>> GetAllCitizensAsync()
        {
            var citizens = await _repository.GetAllAsync();
            return citizens.Select(MapToReadDto);
        }

        public async Task<CitizenDto.CitizenReadDto?> UpdateCitizenAsync(CitizenDto.CitizenUpdateDto dto)
        {
            // Get existing citizen to find UserId
            var existingCitizen = await _repository.GetByIdAsync(dto.CitizenId);
            if (existingCitizen == null) return null;

            // Update User table
            var existingUser = await _userRepository.GetByIdAsync(existingCitizen.UserId);
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

            // Update Citizen table
            var citizen = new Citizen
            {
                CitizenId = dto.CitizenId,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                District = dto.District ?? existingCitizen.District,
                State = "Tamil Nadu"
            };

            var updated = await _repository.UpdateAsync(citizen);
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> DeleteCitizenAsync(string id)
        {
            return await _repository.SoftDeleteAsync(id);
        }

        private static CitizenDto.CitizenReadDto MapToReadDto(Citizen citizen)
        {
            return new CitizenDto.CitizenReadDto
            {
                CitizenId = citizen.CitizenId,
                Name = citizen.Name,
                Email = citizen.Email,
                Phone = citizen.Phone,
                Address = citizen.Address,
                District = citizen.District,
                Username = citizen.User?.Username ?? "N/A",
                ComplaintCount = citizen.Complaints?.Count ?? 0,
                GrievanceCount = citizen.Grievances?.Count ?? 0
            };
        }
    }
}