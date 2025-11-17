namespace SmartComplaint.Models
{
    public class CitizenIdRequest
    {
        public string CitizenId { get; set; } = string.Empty;
    }

    public class OfficerIdRequest
    {
        public string OfficerId { get; set; } = string.Empty;
    }

    public class ComplaintIdRequest
    {
        public int ComplaintId { get; set; }
    }

    public class NotificationIdRequest
    {
        public int NotificationId { get; set; }
    }

    public class UserIdRequest
    {
        public int UserId { get; set; }
    }

    public class GrievanceIdRequest
    {
        public int GrievanceId { get; set; }
    }
}