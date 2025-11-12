using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartComplaint.Models
{
    public class Complaint
    {
        [Key]
        public int ComplaintId { get; set; }

        [Required(ErrorMessage = "Complaint title is required.")]
        [StringLength(150)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Complaint description is required.")]
        [StringLength(500)]
        public string Description { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(150)]
        public string Location { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        
        [StringLength(500)]
        public string? OfficerRemarks { get; set; }

        [StringLength(500)]
        public string? ImagePath { get; set; }
        
        [StringLength(500)]
        public string? OfficerImagePath { get; set; }

        [ForeignKey("Citizen")]
        public string CitizenId { get; set; }
        public Citizen Citizen { get; set; }

        [ForeignKey("Department")]
        public int DepartmentId { get; set; }
        public Department Department { get; set; }

        [ForeignKey("Category")]
        public int CategoryId { get; set; }
        public Category Category { get; set; }

        [ForeignKey("Status")]
        public int StatusId { get; set; }
        public Status Status { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<ComplaintAssignment> ComplaintAssignments { get; set; }
        public ICollection<Grievance> Grievances { get; set; }
        public ICollection<Notification> Notifications { get; set; }
    }
}