using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartComplaint.Migrations
{
    /// <inheritdoc />
    public partial class idupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OfficerId",
                table: "Notifications",
                type: "nvarchar(10)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)");

            migrationBuilder.AddColumn<string>(
                name: "CitizenId",
                table: "Notifications",
                type: "nvarchar(10)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "NotificationId",
                keyValue: 1,
                column: "CitizenId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "NotificationId",
                keyValue: 2,
                column: "CitizenId",
                value: null);

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
                type: "nvarchar(10)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldNullable: true);
        }
    }
}
