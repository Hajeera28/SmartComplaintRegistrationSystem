using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartComplaint.Models.Enums;

namespace SmartComplaint.Models
{
    public class Officer
    {
        [Key]
        [StringLength(10)]
        public string OfficerId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public OfficerRole Role { get; set; }

        [Required(ErrorMessage = "State is required.")]
        [StringLength(50)]
        public string State { get; set; }

        [ForeignKey("Department")]
        public int DepartmentId { get; set; }
        public Department Department { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsApproved { get; set; } = false;
        
        [StringLength(500)]
        public string? ProofDocumentPath { get; set; }

        public ICollection<ComplaintAssignment> ComplaintAssignments { get; set; }
        public ICollection<Grievance> OriginalGrievances { get; set; }
        public ICollection<Grievance> AssignedGrievances { get; set; }
        public ICollection<Notification> Notifications { get; set; }
    }
}