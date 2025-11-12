using System.ComponentModel.DataAnnotations;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.DTOs
{
    public class OfficerDto
    {
        public class OfficerCreateDto
        {
            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100, MinimumLength = 2)]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email format.")]
            [StringLength(100)]
            public string Email { get; set; }

            [Required(ErrorMessage = "Officer role is required.")]
            public OfficerRole Role { get; set; }

            [Required(ErrorMessage = "Department ID is required.")]
            public int DepartmentId { get; set; }

            [Required(ErrorMessage = "Password is required.")]
            [StringLength(255, MinimumLength = 6)]
            public string Password { get; set; }
            
            [Required(ErrorMessage = "Proof document is required.")]
            public IFormFile ProofDocument { get; set; }
        }

        public class OfficerUpdateDto
        {
            public string OfficerId { get; set; } // Set from URL, not required in JSON

            [Required(ErrorMessage = "Name is required.")]
            [StringLength(100, MinimumLength = 2)]
            public string Name { get; set; }

            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email format.")]
            [StringLength(100)]
            public string Email { get; set; }

            [Required(ErrorMessage = "Officer role is required.")]
            public OfficerRole Role { get; set; }

            [Required(ErrorMessage = "Department ID is required.")]
            public int DepartmentId { get; set; }
        }

        public class OfficerReadDto
        {
            public string OfficerId { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public string Role { get; set; }
            public string DepartmentName { get; set; }
            public string Username { get; set; }
            public int AssignedComplaintCount { get; set; }
            public int AssignedGrievanceCount { get; set; }
            public bool IsApproved { get; set; }
            public string? ProofDocumentPath { get; set; }
        }
    }
}