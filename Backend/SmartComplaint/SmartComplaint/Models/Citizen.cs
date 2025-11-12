using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartComplaint.Models
{
    public class Citizen
    {
        [Key]
        [StringLength(10)]
        public string CitizenId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        [StringLength(15)]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(200)]
        public string Address { get; set; }

        [Required(ErrorMessage = "State is required.")]
        [StringLength(50)]
        public string State { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Complaint> Complaints { get; set; }
        public ICollection<Grievance> Grievances { get; set; }
    }
}