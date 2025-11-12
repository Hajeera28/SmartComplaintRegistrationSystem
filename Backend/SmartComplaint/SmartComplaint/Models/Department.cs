using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Department name is required.")]
        [StringLength(100)]
        public string DepartmentName { get; set; }

        [StringLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Officer> Officers { get; set; }
        public ICollection<Complaint> Complaints { get; set; }
    }
}