using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssignmentSystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClassSectionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TeacherAssignments_TeacherId_ClassId_SubjectId",
                table: "TeacherAssignments");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Classes");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "TeacherAssignments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "StudentEnrollments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "NumberOfSections",
                table: "Classes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Assignments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAssignments_TeacherId_ClassId_SubjectId_Section",
                table: "TeacherAssignments",
                columns: new[] { "TeacherId", "ClassId", "SubjectId", "Section" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TeacherAssignments_TeacherId_ClassId_SubjectId_Section",
                table: "TeacherAssignments");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "TeacherAssignments");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "StudentEnrollments");

            migrationBuilder.DropColumn(
                name: "NumberOfSections",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Assignments");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Classes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAssignments_TeacherId_ClassId_SubjectId",
                table: "TeacherAssignments",
                columns: new[] { "TeacherId", "ClassId", "SubjectId" },
                unique: true);
        }
    }
}
