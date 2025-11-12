using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.DTOs
{
    public class DepartmentDto
    {
        public class DepartmentCreateDto
        {
            [Required(ErrorMessage = "Department name is required.")]
            [StringLength(100, MinimumLength = 2)]
            public string DepartmentName { get; set; }

            [Required(ErrorMessage = "Description is required.")]
            [StringLength(200, MinimumLength = 10)]
            public string Description { get; set; }
        }

        public class DepartmentUpdateDto
        {
            [Required]
            public int DepartmentId { get; set; }

            [Required(ErrorMessage = "Department name is required.")]
            [StringLength(100, MinimumLength = 2)]
            public string DepartmentName { get; set; }

            [Required(ErrorMessage = "Description is required.")]
            [StringLength(200, MinimumLength = 10)]
            public string Description { get; set; }
        }

        public class DepartmentReadDto
        {
            public int DepartmentId { get; set; }
            public string DepartmentName { get; set; }
            public string Description { get; set; }
            public int OfficerCount { get; set; }
            public int ComplaintCount { get; set; }
        }
    }
}