using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SmartComplaint.DTOs
{
    public class GrievanceDto
    {
        public class GrievanceCreateDto
        {
            [Required(ErrorMessage = "Complaint ID is required.")]
            public int ComplaintId { get; set; }

            [Required(ErrorMessage = "Citizen ID is required.")]
            public string CitizenId { get; set; }

            [Required(ErrorMessage = "Description is required.")]
            [StringLength(500)]
            public string Description { get; set; }

            public IFormFile? Image { get; set; }
        }

        public class GrievanceUpdateDto
        {
            [Required]
            public int GrievanceId { get; set; }

            [StringLength(500)]
            public string? Response { get; set; }
        }
        
        public class GrievanceStatusUpdateDto
        {
            [Required]
            public int GrievanceId { get; set; }

            [Required(ErrorMessage = "Status ID is required.")]
            public int StatusId { get; set; }

            [StringLength(500)]
            public string? OfficerRemarks { get; set; }
            
            public IFormFile? OfficerImage { get; set; }
        }

        public class GrievanceReadDto
        {
            public int GrievanceId { get; set; }
            public string Description { get; set; }
            public DateTime RaisedDate { get; set; }
            public string? Response { get; set; }
            public DateTime? ResponseDate { get; set; }
            public string ComplaintTitle { get; set; }
            public string OriginalOfficerName { get; set; }
            public string AssignedOfficerName { get; set; }
            public string GrievanceStatus { get; set; }
            public string? OfficerRemarks { get; set; }
            public string? ImagePath { get; set; }
            public string? OfficerImagePath { get; set; }
            public string CitizenName { get; set; }
            public int ComplaintId { get; set; }
        }
    }
}
