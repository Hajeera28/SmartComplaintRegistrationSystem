using SmartComplaint.DTOs;
using SmartComplaint.Interfaces;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Services
{
    public class UserService
    {
        private readonly IUser _repository;

        public UserService(IUser repository)
        {
            _repository = repository;
        }

        public async Task<UserDto.UserReadDto> CreateUserAsync(UserDto.UserCreateDto dto)
        {
            // Check if email already exists
            var existingUser = await _repository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Password = dto.Password, // In production, hash this password
                Role = dto.Role
            };

            var created = await _repository.CreateAsync(user);
            return MapToReadDto(created);
        }

        public async Task<UserDto.UserReadDto?> GetUserByIdAsync(int id)
        {
            var user = await _repository.GetByIdAsync(id);
            return user == null ? null : MapToReadDto(user);
        }

        public async Task<UserDto.UserReadDto?> GetUserByEmailAsync(string email)
        {
            var user = await _repository.GetByEmailAsync(email);
            return user == null ? null : MapToReadDto(user);
        }

        public async Task<UserDto.UserReadDto?> GetUserByUsernameAsync(string username)
        {
            var user = await _repository.GetByUsernameAsync(username);
            return user == null ? null : MapToReadDto(user);
        }

        public async Task<IEnumerable<UserDto.UserReadDto>> GetAllUsersAsync()
        {
            var users = await _repository.GetAllAsync();
            return users.Select(MapToReadDto);
        }

        public async Task<IEnumerable<UserDto.UserReadDto>> GetUsersByRoleAsync(UserRole role)
        {
            var users = await _repository.GetByRoleAsync(role);
            return users.Select(MapToReadDto);
        }

        public async Task<UserDto.UserReadDto?> UpdateUserAsync(UserDto.UserUpdateDto dto)
        {
            var user = new User
            {
                UserId = dto.UserId,
                Username = dto.Username,
                Email = dto.Email,
                Role = dto.Role
            };

            var updated = await _repository.UpdateAsync(user);
            return updated == null ? null : MapToReadDto(updated);
        }

        public async Task<bool> DeleteUserAsync(int id, string deletedBy)
        {
            return await _repository.SoftDeleteAsync(id, deletedBy);
        }

        public async Task<User?> ValidateUserAsync(string email, string password)
        {
            return await _repository.ValidateLoginAsync(email, password);
        }

        public async Task<UserDto.UserReadDto?> LoginAsync(UserDto.LoginDto dto)
        {
            var user = await _repository.ValidateLoginAsync(dto.Email, dto.Password);
            return user == null ? null : MapToReadDto(user);
        }

        public async Task<UserDto.UserReadDto> RegisterCitizenAsync(UserDto.CitizenRegisterDto dto)
        {
            // Check if email already exists
            var existingUser = await _repository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already exists");

            // Create User record
            var user = new User
            {
                Username = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = UserRole.Citizen
            };

            var createdUser = await _repository.CreateAsync(user);
            return MapToReadDto(createdUser);
        }

        public async Task<UserDto.UserReadDto> RegisterOfficerAsync(UserDto.OfficerRegisterDto dto)
        {
            // Check if email already exists
            var existingUser = await _repository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already exists");

            // Create User record
            var user = new User
            {
                Username = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = UserRole.Officer
            };

            var createdUser = await _repository.CreateAsync(user);
            return MapToReadDto(createdUser);
        }



        private static UserDto.UserReadDto MapToReadDto(User user)
        {
            return new UserDto.UserReadDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            };
        }
    }
}