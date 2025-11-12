using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.Models
{
    public class Status
    {
        [Key]
        public int StatusId { get; set; }

        [Required(ErrorMessage = "Status name is required.")]
        [StringLength(50)]
        public string StatusName { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Complaint> Complaints { get; set; }
        public ICollection<Grievance> Grievances { get; set; }
    }
}