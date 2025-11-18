using System.ComponentModel.DataAnnotations;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.DTOs
{
    public class CitizenDto
    {
        public class CitizenCreateDto
        {
            [Required(ErrorMessage = "Citizen name is required.")]
            [StringLength(100)]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email format.")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Phone number is required.")]
            [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number.")]
            public string Phone { get; set; }

            [Required(ErrorMessage = "Address is required.")]
            [StringLength(200)]
            public string Address { get; set; }

            [Required(ErrorMessage = "District is required.")]
            [StringLength(50)]
            public string District { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(255, MinimumLength = 6)]
            public string Password { get; set; }
        }

        
        public class CitizenUpdateDto
        {
            public string CitizenId { get; set; } // Set from URL, not required in JSON

            [Required(ErrorMessage = "Citizen name is required.")]
            [StringLength(100)]
            public string Name { get; set; }

            [EmailAddress(ErrorMessage = "Invalid email format.")]
            public string Email { get; set; }

            [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number.")]
            public string Phone { get; set; }

            [StringLength(200)]
            public string Address { get; set; }

            [StringLength(50)]
            public string District { get; set; }
        }

        
        public class CitizenReadDto
        {
            public string CitizenId { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Address { get; set; }
            public string District { get; set; }
            public string Username { get; set; }
            public int ComplaintCount { get; set; }
            public int GrievanceCount { get; set; }
        }
    }
}
