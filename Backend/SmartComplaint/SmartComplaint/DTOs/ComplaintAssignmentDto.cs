using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.DTOs
{
    public class ComplaintAssignmentDto
    {
        public class ComplaintAssignmentCreateDto
        {
            [Required(ErrorMessage = "Complaint ID is required.")]
            public int ComplaintId { get; set; }

            [Required(ErrorMessage = "Officer ID is required.")]
            public string OfficerId { get; set; }



            [StringLength(200)]
            public string? Remarks { get; set; }
        }

        public class ComplaintAssignmentReadDto
        {
            public int ComplaintId { get; set; }
            public string OfficerId { get; set; }
            public string ComplaintTitle { get; set; }
            public string OfficerName { get; set; }

            public DateTime AssignedDate { get; set; }
            public string? Remarks { get; set; }
        }
    }
}