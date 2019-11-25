using Microsoft.EntityFrameworkCore.Migrations;

namespace PIXIRunnerApp.Migrations.Game
{
    public partial class DisabledSound : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SoundEnabled",
                table: "UserGameSettings",
                newName: "SoundDisabled");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SoundDisabled",
                table: "UserGameSettings",
                newName: "SoundEnabled");
        }
    }
}
