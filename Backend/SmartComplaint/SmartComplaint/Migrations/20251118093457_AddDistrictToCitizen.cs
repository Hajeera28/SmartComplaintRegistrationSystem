using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartComplaint.Migrations
{
    /// <inheritdoc />
    public partial class AddDistrictToCitizen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "Citizens",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Citizens",
                keyColumn: "CitizenId",
                keyValue: "CITTA001",
                column: "District",
                value: "Chennai");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "District",
                table: "Citizens");
        }
    }
}
