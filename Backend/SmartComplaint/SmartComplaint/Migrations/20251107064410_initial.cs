using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartComplaint.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.DepartmentId);
                });

            migrationBuilder.CreateTable(
                name: "Statuses",
                columns: table => new
                {
                    StatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Statuses", x => x.StatusId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                    table.ForeignKey(
                        name: "FK_Categories_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Citizens",
                columns: table => new
                {
                    CitizenId = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    State = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citizens", x => x.CitizenId);
                    table.ForeignKey(
                        name: "FK_Citizens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Officers",
                columns: table => new
                {
                    OfficerId = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    State = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ProofDocumentPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Officers", x => x.OfficerId);
                    table.ForeignKey(
                        name: "FK_Officers_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Officers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Complaints",
                columns: table => new
                {
                    ComplaintId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfficerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OfficerImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CitizenId = table.Column<string>(type: "nvarchar(10)", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Complaints", x => x.ComplaintId);
                    table.ForeignKey(
                        name: "FK_Complaints_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Complaints_Citizens_CitizenId",
                        column: x => x.CitizenId,
                        principalTable: "Citizens",
                        principalColumn: "CitizenId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Complaints_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Complaints_Statuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Statuses",
                        principalColumn: "StatusId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ComplaintAssignments",
                columns: table => new
                {
                    OfficerId = table.Column<string>(type: "nvarchar(10)", nullable: false),
                    ComplaintId = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplaintAssignments", x => new { x.OfficerId, x.ComplaintId });
                    table.ForeignKey(
                        name: "FK_ComplaintAssignments_Complaints_ComplaintId",
                        column: x => x.ComplaintId,
                        principalTable: "Complaints",
                        principalColumn: "ComplaintId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ComplaintAssignments_Officers_OfficerId",
                        column: x => x.OfficerId,
                        principalTable: "Officers",
                        principalColumn: "OfficerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Grievances",
                columns: table => new
                {
                    GrievanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RaisedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Response = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ComplaintId = table.Column<int>(type: "int", nullable: false),
                    CitizenId = table.Column<string>(type: "nvarchar(10)", nullable: false),
                    OriginalOfficerId = table.Column<string>(type: "nvarchar(10)", nullable: true),
                    AssignedOfficerId = table.Column<string>(type: "nvarchar(10)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    OfficerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OfficerImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grievances", x => x.GrievanceId);
                    table.ForeignKey(
                        name: "FK_Grievances_Citizens_CitizenId",
                        column: x => x.CitizenId,
                        principalTable: "Citizens",
                        principalColumn: "CitizenId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Grievances_Complaints_ComplaintId",
                        column: x => x.ComplaintId,
                        principalTable: "Complaints",
                        principalColumn: "ComplaintId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Grievances_Officers_AssignedOfficerId",
                        column: x => x.AssignedOfficerId,
                        principalTable: "Officers",
                        principalColumn: "OfficerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Grievances_Officers_OriginalOfficerId",
                        column: x => x.OriginalOfficerId,
                        principalTable: "Officers",
                        principalColumn: "OfficerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Grievances_Statuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Statuses",
                        principalColumn: "StatusId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    OfficerId = table.Column<string>(type: "nvarchar(10)", nullable: false),
                    ComplaintId = table.Column<int>(type: "int", nullable: true),
                    GrievanceId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_Complaints_ComplaintId",
                        column: x => x.ComplaintId,
                        principalTable: "Complaints",
                        principalColumn: "ComplaintId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Grievances_GrievanceId",
                        column: x => x.GrievanceId,
                        principalTable: "Grievances",
                        principalColumn: "GrievanceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Officers_OfficerId",
                        column: x => x.OfficerId,
                        principalTable: "Officers",
                        principalColumn: "OfficerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "DepartmentId", "DepartmentName", "Description", "IsActive" },
                values: new object[,]
                {
                    { 1, "Public Works", "Handles infrastructure and road-related issues.", true },
                    { 2, "Sanitation", "Manages cleanliness, waste, and hygiene concerns.", true },
                    { 3, "Water Supply", "Resolves water supply and leakage complaints.", true }
                });

            migrationBuilder.InsertData(
                table: "Statuses",
                columns: new[] { "StatusId", "IsActive", "StatusName" },
                values: new object[,]
                {
                    { 1, true, "Pending" },
                    { 2, true, "InProgress" },
                    { 3, true, "Resolved" },
                    { 4, true, "Closed" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Email", "IsActive", "Password", "Role", "Username" },
                values: new object[,]
                {
                    { 1, "admin@gmail.com", true, "Admin@123", 3, "Admin" },
                    { 2, "raj@gmail.com", true, "Officer@123", 2, "Raj Kumar" },
                    { 3, "anu@gmail.com", true, "Citizen@123", 1, "Anu Priya" }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "CategoryName", "DepartmentId", "IsActive" },
                values: new object[,]
                {
                    { 1, "Road Repair", 1, true },
                    { 2, "Street Lighting", 1, true },
                    { 3, "Cleanliness", 2, true },
                    { 4, "Waste Collection", 2, true },
                    { 5, "Water Leakage", 3, true },
                    { 6, "No Water Supply", 3, true }
                });

            migrationBuilder.InsertData(
                table: "Citizens",
                columns: new[] { "CitizenId", "Address", "Email", "IsActive", "Name", "Phone", "State", "UserId" },
                values: new object[] { "CITTA001", "12, Gandhi Street, Chennai", "anu@gmail.com", true, "Anu Priya", "9876543210", "Tamil Nadu", 3 });

            migrationBuilder.InsertData(
                table: "Officers",
                columns: new[] { "OfficerId", "DepartmentId", "Email", "IsActive", "IsApproved", "Name", "ProofDocumentPath", "Role", "State", "UserId" },
                values: new object[] { "OFFFO001", 1, "raj@gmail.com", true, false, "Raj Kumar", null, 1, "Tamil Nadu", 2 });

            migrationBuilder.InsertData(
                table: "Complaints",
                columns: new[] { "ComplaintId", "CategoryId", "CitizenId", "CreatedAt", "DepartmentId", "Description", "ImagePath", "IsActive", "Location", "OfficerImagePath", "OfficerRemarks", "StatusId", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 2, "CITTA001", new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Unspecified), 1, "Street light near my house is not working for over a week.", null, true, "Anna Nagar, Chennai", null, null, 1, "Broken Street Light", null },
                    { 2, 4, "CITTA001", new DateTime(2025, 1, 2, 9, 30, 0, 0, DateTimeKind.Unspecified), 2, "Garbage has not been collected in our area for 3 days.", null, true, "T Nagar, Chennai", null, null, 2, "Garbage Not Collected", null }
                });

            migrationBuilder.InsertData(
                table: "ComplaintAssignments",
                columns: new[] { "ComplaintId", "OfficerId", "AssignedDate", "IsActive", "Remarks" },
                values: new object[,]
                {
                    { 1, "OFFFO001", new DateTime(2025, 1, 1, 12, 0, 0, 0, DateTimeKind.Unspecified), true, "Assigned for field inspection" },
                    { 2, "OFFFO001", new DateTime(2025, 1, 2, 12, 0, 0, 0, DateTimeKind.Unspecified), true, "Pending assignment approval" }
                });

            migrationBuilder.InsertData(
                table: "Grievances",
                columns: new[] { "GrievanceId", "AssignedOfficerId", "CitizenId", "ComplaintId", "Description", "ImagePath", "IsActive", "OfficerImagePath", "OfficerRemarks", "OriginalOfficerId", "RaisedDate", "Response", "ResponseDate", "StatusId" },
                values: new object[] { 1, null, "CITTA001", 1, "Complaint not resolved within promised timeframe", null, true, null, null, "OFFFO001", new DateTime(2025, 1, 5, 14, 0, 0, 0, DateTimeKind.Unspecified), null, null, 1 });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "NotificationId", "ComplaintId", "CreatedAt", "GrievanceId", "IsActive", "IsRead", "Message", "OfficerId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2025, 1, 1, 12, 5, 0, 0, DateTimeKind.Unspecified), null, true, false, "New complaint assigned: Broken Street Light", "OFFFO001" },
                    { 2, null, new DateTime(2025, 1, 5, 14, 5, 0, 0, DateTimeKind.Unspecified), 1, true, false, "Grievance raised for complaint: Broken Street Light", "OFFFO001" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_DepartmentId",
                table: "Categories",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Citizens_UserId",
                table: "Citizens",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComplaintAssignments_ComplaintId",
                table: "ComplaintAssignments",
                column: "ComplaintId");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_CategoryId",
                table: "Complaints",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_CitizenId",
                table: "Complaints",
                column: "CitizenId");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_DepartmentId",
                table: "Complaints",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_StatusId",
                table: "Complaints",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_AssignedOfficerId",
                table: "Grievances",
                column: "AssignedOfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_CitizenId",
                table: "Grievances",
                column: "CitizenId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_ComplaintId",
                table: "Grievances",
                column: "ComplaintId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_OriginalOfficerId",
                table: "Grievances",
                column: "OriginalOfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_Grievances_StatusId",
                table: "Grievances",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ComplaintId",
                table: "Notifications",
                column: "ComplaintId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_GrievanceId",
                table: "Notifications",
                column: "GrievanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_OfficerId",
                table: "Notifications",
                column: "OfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_Officers_DepartmentId",
                table: "Officers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Officers_UserId",
                table: "Officers",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComplaintAssignments");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Grievances");

            migrationBuilder.DropTable(
                name: "Complaints");

            migrationBuilder.DropTable(
                name: "Officers");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Citizens");

            migrationBuilder.DropTable(
                name: "Statuses");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
