using Microsoft.EntityFrameworkCore.Migrations;

namespace PIXIRunnerApp.Migrations.Game
{
    public partial class removeFKGameState : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinId",
                table: "UserGameState");

            migrationBuilder.RenameColumn(
                name: "SelectedSkinId",
                table: "UserGameState",
                newName: "SelectedSkinID");

            migrationBuilder.RenameIndex(
                name: "IX_UserGameState_SelectedSkinId",
                table: "UserGameState",
                newName: "IX_UserGameState_SelectedSkinID");

            migrationBuilder.AlterColumn<int>(
                name: "SelectedSkinID",
                table: "UserGameState",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinID",
                table: "UserGameState",
                column: "SelectedSkinID",
                principalTable: "GameSkin",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinID",
                table: "UserGameState");

            migrationBuilder.RenameColumn(
                name: "SelectedSkinID",
                table: "UserGameState",
                newName: "SelectedSkinId");

            migrationBuilder.RenameIndex(
                name: "IX_UserGameState_SelectedSkinID",
                table: "UserGameState",
                newName: "IX_UserGameState_SelectedSkinId");

            migrationBuilder.AlterColumn<int>(
                name: "SelectedSkinId",
                table: "UserGameState",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinId",
                table: "UserGameState",
                column: "SelectedSkinId",
                principalTable: "GameSkin",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
