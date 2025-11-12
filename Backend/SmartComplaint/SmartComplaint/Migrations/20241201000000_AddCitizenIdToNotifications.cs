using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartComplaint.Migrations
{
    /// <inheritdoc />
    public partial class AddCitizenIdToNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OfficerId",
                table: "Notifications",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "CitizenId",
                table: "Notifications",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CitizenId",
                table: "Notifications",
                column: "CitizenId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Citizens_CitizenId",
                table: "Notifications",
                column: "CitizenId",
                principalTable: "Citizens",
                principalColumn: "CitizenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Citizens_CitizenId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_CitizenId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "CitizenId",
                table: "Notifications");

            migrationBuilder.AlterColumn<string>(
                name: "OfficerId",
                table: "Notifications",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}