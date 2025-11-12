using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartComplaint.Models
{
    public class Grievance
    {
        [Key]
        public int GrievanceId { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(500)]
        public string Description { get; set; }

        public DateTime RaisedDate { get; set; } = DateTime.Now;
        
        [StringLength(500)]
        public string? Response { get; set; }
        
        public DateTime? ResponseDate { get; set; }

        [StringLength(500)]
        public string? ImagePath { get; set; }

        [ForeignKey("Complaint")]
        public int ComplaintId { get; set; }
        public Complaint Complaint { get; set; }

        [ForeignKey("Citizen")]
        public string CitizenId { get; set; }
        public Citizen Citizen { get; set; }

        [ForeignKey("OriginalOfficer")]
        public string? OriginalOfficerId { get; set; }
        public Officer OriginalOfficer { get; set; }

        [ForeignKey("AssignedOfficer")]
        public string? AssignedOfficerId { get; set; }
        public Officer AssignedOfficer { get; set; }

        [ForeignKey("Status")]
        public int StatusId { get; set; } = 1;
        public Status Status { get; set; }
        
        [StringLength(500)]
        public string? OfficerRemarks { get; set; }
        
        [StringLength(500)]
        public string? OfficerImagePath { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Notification> Notifications { get; set; }
    }
}