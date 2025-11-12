using System.ComponentModel.DataAnnotations;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100)]
        public string Username { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(255)]
        public string Password { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public UserRole Role { get; set; }

        public bool IsActive { get; set; } = true;

        public Citizen Citizen { get; set; }
        public Officer Officer { get; set; }
    }
}