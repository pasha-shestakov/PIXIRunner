using Microsoft.EntityFrameworkCore.Migrations;

namespace PIXIRunnerApp.Migrations.Game
{
    public partial class Checkpoint : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Checkpoint",
                table: "UserGameState",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Checkpoint",
                table: "UserGameState");
        }
    }
}
