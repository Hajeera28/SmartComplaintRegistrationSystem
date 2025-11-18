using Microsoft.EntityFrameworkCore;
using SmartComplaint.Models;
using SmartComplaint.Models.Enums;
using System;

namespace SmartComplaint.Data
{
    public class ComplaintContext : DbContext
    {
        public ComplaintContext(DbContextOptions<ComplaintContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Citizen> Citizens { get; set; }
        public DbSet<Officer> Officers { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<ComplaintAssignment> ComplaintAssignments { get; set; }
        public DbSet<Grievance> Grievances { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Category> Categories { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            

            // Global Query Filters for Soft Delete
            modelBuilder.Entity<User>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Citizen>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Officer>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Department>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Complaint>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Status>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<ComplaintAssignment>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Grievance>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Notification>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Category>().HasQueryFilter(e => e.IsActive);

           
            
            // Citizen ↔ User (One-to-One)
            modelBuilder.Entity<Citizen>()
                .HasOne(c => c.User)
                .WithOne(u => u.Citizen)
                .HasForeignKey<Citizen>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Officer ↔ User (One-to-One)
            modelBuilder.Entity<Officer>()
                .HasOne(o => o.User)
                .WithOne(u => u.Officer)
                .HasForeignKey<Officer>(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Department ↔ Officer (One-to-Many)
            modelBuilder.Entity<Officer>()
                .HasOne(o => o.Department)
                .WithMany(d => d.Officers)
                .HasForeignKey(o => o.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Department ↔ Complaint (One-to-Many)
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Department)
                .WithMany(d => d.Complaints)
                .HasForeignKey(c => c.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Citizen ↔ Complaint (One-to-Many)
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Citizen)
                .WithMany(cz => cz.Complaints)
                .HasForeignKey(c => c.CitizenId)
                .OnDelete(DeleteBehavior.Restrict);

            // Status ↔ Complaint (One-to-Many)
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Status)
                .WithMany(cs => cs.Complaints)
                .HasForeignKey(c => c.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            // ComplaintAssignment (Junction Table)
            modelBuilder.Entity<ComplaintAssignment>()
                .HasKey(ca => new { ca.OfficerId, ca.ComplaintId });

            modelBuilder.Entity<ComplaintAssignment>()
                .HasOne(ca => ca.Officer)
                .WithMany(o => o.ComplaintAssignments)
                .HasForeignKey(ca => ca.OfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ComplaintAssignment>()
                .HasOne(ca => ca.Complaint)
                .WithMany(c => c.ComplaintAssignments)
                .HasForeignKey(ca => ca.ComplaintId)
                .OnDelete(DeleteBehavior.Restrict);



            
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Officer)
                .WithMany(o => o.Notifications)
                .HasForeignKey(n => n.OfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Complaint)
                .WithMany(c => c.Notifications)
                .HasForeignKey(n => n.ComplaintId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Grievance)
                .WithMany(g => g.Notifications)
                .HasForeignKey(n => n.GrievanceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Grievance relationships
            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.Citizen)
                .WithMany(c => c.Grievances)
                .HasForeignKey(g => g.CitizenId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.Complaint)
                .WithMany(c => c.Grievances)
                .HasForeignKey(g => g.ComplaintId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.OriginalOfficer)
                .WithMany(o => o.OriginalGrievances)
                .HasForeignKey(g => g.OriginalOfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.AssignedOfficer)
                .WithMany(o => o.AssignedGrievances)
                .HasForeignKey(g => g.AssignedOfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Status ↔ Grievance (One-to-Many)
            modelBuilder.Entity<Grievance>()
                .HasOne(g => g.Status)
                .WithMany(s => s.Grievances)
                .HasForeignKey(g => g.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            // Category ↔ Complaint (One-to-Many)
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.Category)
                .WithMany(cat => cat.Complaints)
                .HasForeignKey(c => c.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);





            // Departments
            modelBuilder.Entity<Department>().HasData(
                new Department { DepartmentId = 1, DepartmentName = "Public Works", Description = "Handles infrastructure and road-related issues.", IsActive = true },
                new Department { DepartmentId = 2, DepartmentName = "Sanitation", Description = "Manages cleanliness, waste, and hygiene concerns.", IsActive = true },
                new Department { DepartmentId = 3, DepartmentName = "Water Supply", Description = "Resolves water supply and leakage complaints.", IsActive = true }
            );

            // Statuses
            modelBuilder.Entity<Status>().HasData(
                new Status { StatusId = 1, StatusName = "Pending", IsActive = true },
                new Status { StatusId = 2, StatusName = "InProgress", IsActive = true },
                new Status { StatusId = 3, StatusName = "Resolved", IsActive = true },
                new Status { StatusId = 4, StatusName = "Closed", IsActive = true }
            );

            // Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, CategoryName = "Road Repair", DepartmentId = 1, IsActive = true },
                new Category { CategoryId = 2, CategoryName = "Street Lighting", DepartmentId = 1, IsActive = true },
                new Category { CategoryId = 3, CategoryName = "Cleanliness", DepartmentId = 2, IsActive = true },
                new Category { CategoryId = 4, CategoryName = "Waste Collection", DepartmentId = 2, IsActive = true },
                new Category { CategoryId = 5, CategoryName = "Water Leakage", DepartmentId = 3, IsActive = true },
                new Category { CategoryId = 6, CategoryName = "No Water Supply", DepartmentId = 3, IsActive = true }
            );

            // Users
            modelBuilder.Entity<User>().HasData(
                new User { UserId = 1, Username = "Admin", Email = "admin@gmail.com", Password = "Admin@123", Role = UserRole.Admin, IsActive = true },
                new User { UserId = 2, Username = "Raj Kumar", Email = "raj@gmail.com", Password = "Officer@123", Role = UserRole.Officer, IsActive = true },
                new User { UserId = 3, Username = "Anu Priya", Email = "anu@gmail.com", Password = "Citizen@123", Role = UserRole.Citizen, IsActive = true }
            );

            // Officers
            modelBuilder.Entity<Officer>().HasData(
                new Officer
                {
                    OfficerId = "OFFFO001",
                    Name = "Raj Kumar",
                    Email = "raj@gmail.com",
                    State = "Tamil Nadu",
                    Role = OfficerRole.FieldOfficer,
                    DepartmentId = 1,
                    UserId = 2,
                    IsActive = true
                }
            );

            // Citizens
            modelBuilder.Entity<Citizen>().HasData(
                new Citizen
                {
                    CitizenId = "CITTA001",
                    Name = "Anu Priya",
                    Email = "anu@gmail.com",
                    Phone = "9876543210",
                    Address = "12, Gandhi Street, Chennai",
                    State = "Tamil Nadu",
                    District = "Chennai",
                    UserId = 3,
                    IsActive = true
                }
            );

            // Complaints
            modelBuilder.Entity<Complaint>().HasData(
                new Complaint
                {
                    ComplaintId = 1,
                    Title = "Broken Street Light",
                    Description = "Street light near my house is not working for over a week.",
                    Location = "Anna Nagar, Chennai",
                    CitizenId = "CITTA001",
                    DepartmentId = 1,
                    CategoryId = 2,
                    StatusId = 1,
                    CreatedAt = new DateTime(2025, 1, 1, 10, 0, 0),
                    IsActive = true
                },
                new Complaint
                {
                    ComplaintId = 2,
                    Title = "Garbage Not Collected",
                    Description = "Garbage has not been collected in our area for 3 days.",
                    Location = "T Nagar, Chennai",
                    CitizenId = "CITTA001",
                    DepartmentId = 2,
                    CategoryId = 4,
                    StatusId = 2,
                    CreatedAt = new DateTime(2025, 1, 2, 9, 30, 0),
                    IsActive = true
                }
            );

            // Complaint Assignments
            modelBuilder.Entity<ComplaintAssignment>().HasData(
                new ComplaintAssignment
                {
                    OfficerId = "OFFFO001",
                    ComplaintId = 1,
                    AssignedDate = new DateTime(2025, 1, 1, 12, 0, 0),
                    Remarks = "Assigned for field inspection",
                    IsActive = true
                },
                new ComplaintAssignment
                {
                    OfficerId = "OFFFO001",
                    ComplaintId = 2,
                    AssignedDate = new DateTime(2025, 1, 2, 12, 0, 0),
                    Remarks = "Pending assignment approval",
                    IsActive = true
                }
            );

            // Grievances
            modelBuilder.Entity<Grievance>().HasData(
                new Grievance
                {
                    GrievanceId = 1,
                    Description = "Complaint not resolved within promised timeframe",
                    RaisedDate = new DateTime(2025, 1, 5, 14, 0, 0),
                    ComplaintId = 1,
                    CitizenId = "CITTA001",
                    OriginalOfficerId = "OFFFO001",
                    IsActive = true
                }
            );

            // Notifications
            modelBuilder.Entity<Notification>().HasData(
                new Notification
                {
                    NotificationId = 1,
                    Message = "New complaint assigned: Broken Street Light",
                    CreatedAt = new DateTime(2025, 1, 1, 12, 5, 0),
                    IsRead = false,
                    OfficerId = "OFFFO001",
                    ComplaintId = 1,
                    IsActive = true
                },
                new Notification
                {
                    NotificationId = 2,
                    Message = "Grievance raised for complaint: Broken Street Light",
                    CreatedAt = new DateTime(2025, 1, 5, 14, 5, 0),
                    IsRead = false,
                    OfficerId = "OFFFO001",
                    GrievanceId = 1,
                    IsActive = true
                }
            );
        }
    }
}
