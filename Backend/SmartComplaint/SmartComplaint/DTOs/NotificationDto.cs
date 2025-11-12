using System.ComponentModel.DataAnnotations;

namespace SmartComplaint.DTOs
{
    public class NotificationDto
    {
        public class NotificationCreateDto
        {
            [Required(ErrorMessage = "Message is required.")]
            [StringLength(200, MinimumLength = 5)]
            public string Message { get; set; }

            public string? OfficerId { get; set; }
            public string? CitizenId { get; set; }

            public int? ComplaintId { get; set; }
            public int? GrievanceId { get; set; }
        }

        public class NotificationReadDto
        {
            public int NotificationId { get; set; }
            public string Message { get; set; }
            public DateTime CreatedAt { get; set; }
            public bool IsRead { get; set; }
            public string OfficerName { get; set; }
            public int? ComplaintId { get; set; }
            public string? ComplaintTitle { get; set; }
            public int? GrievanceId { get; set; }
        }
    }
}