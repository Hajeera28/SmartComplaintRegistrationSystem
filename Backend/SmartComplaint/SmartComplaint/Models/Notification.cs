using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartComplaint.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required(ErrorMessage = "Message is required.")]
        [StringLength(200)]
        public string Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;

        [ForeignKey("Officer")]
        public string? OfficerId { get; set; }
        public Officer? Officer { get; set; }

        [ForeignKey("Citizen")]
        public string? CitizenId { get; set; }
        public Citizen? Citizen { get; set; }

        [ForeignKey("Complaint")]
        public int? ComplaintId { get; set; }
        public Complaint? Complaint { get; set; }

        [ForeignKey("Grievance")]
        public int? GrievanceId { get; set; }
        public Grievance? Grievance { get; set; }

        public bool IsActive { get; set; } = true;
    }
}