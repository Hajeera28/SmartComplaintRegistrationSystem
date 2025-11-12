using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.Models
{
    public class ComplaintAssignment
    {
        public string OfficerId { get; set; }
        public Officer Officer { get; set; }

        public int ComplaintId { get; set; }
        public Complaint Complaint { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.Now;

        [StringLength(300)]
        public string? Remarks { get; set; }

        public bool IsActive { get; set; } = true;
    }
}