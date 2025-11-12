using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SmartComplaint.DTOs
{
    public class ComplaintDto
    {
        public class ComplaintCreateDto
        {
            [Required(ErrorMessage = "Title is required.")]
            [StringLength(100)]
            public string Title { get; set; }

            [Required(ErrorMessage = "Description is required.")]
            [StringLength(500)]
            public string Description { get; set; }

            [Required(ErrorMessage = "Citizen ID is required.")]
            public string CitizenId { get; set; }

            [Required(ErrorMessage = "Department ID is required.")]
            public int DepartmentId { get; set; }

            [Required(ErrorMessage = "Category ID is required.")]
            public int CategoryId { get; set; }

            [Required(ErrorMessage = "Location is required.")]
            [StringLength(150)]
            public string Location { get; set; }

            public IFormFile? Image { get; set; }
        }

        public class ComplaintUpdateDto
        {
            [Required]
            public int ComplaintId { get; set; }

            [Required(ErrorMessage = "Status ID is required.")]
            public int StatusId { get; set; }

            [StringLength(500)]
            public string? OfficerRemarks { get; set; }
            
            public IFormFile? OfficerImage { get; set; }
        }

        public class ComplaintReadDto
        {
            public int ComplaintId { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Location { get; set; }
            public string DepartmentName { get; set; }
            public string CategoryName { get; set; }
            public string ComplaintStatus { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public string? OfficerRemarks { get; set; }
            public string? ImagePath { get; set; }
            public string? OfficerImagePath { get; set; }
            public string? AssignedOfficerId { get; set; }
            public bool HasGrievance { get; set; }
        }
    }
}
