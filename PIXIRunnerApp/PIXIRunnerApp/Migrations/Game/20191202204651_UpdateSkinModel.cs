using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PIXIRunnerApp.Migrations.Game
{
    public partial class UpdateSkinModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GameSkin_UserGameState_UserGameStateID",
                table: "GameSkin");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinID",
                table: "UserGameState");

            migrationBuilder.DropIndex(
                name: "IX_UserGameState_SelectedSkinID",
                table: "UserGameState");

            migrationBuilder.DropIndex(
                name: "IX_GameSkin_UserGameStateID",
                table: "GameSkin");

            migrationBuilder.DropColumn(
                name: "UserGameStateID",
                table: "GameSkin");

            migrationBuilder.AlterColumn<int>(
                name: "SelectedSkinID",
                table: "UserGameState",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "UserUnlockedSkins",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    userGameStateID = table.Column<int>(nullable: false),
                    skinID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserUnlockedSkins", x => x.ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserUnlockedSkins");

            migrationBuilder.AlterColumn<int>(
                name: "SelectedSkinID",
                table: "UserGameState",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddColumn<int>(
                name: "UserGameStateID",
                table: "GameSkin",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGameState_SelectedSkinID",
                table: "UserGameState",
                column: "SelectedSkinID");

            migrationBuilder.CreateIndex(
                name: "IX_GameSkin_UserGameStateID",
                table: "GameSkin",
                column: "UserGameStateID");

            migrationBuilder.AddForeignKey(
                name: "FK_GameSkin_UserGameState_UserGameStateID",
                table: "GameSkin",
                column: "UserGameStateID",
                principalTable: "UserGameState",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinID",
                table: "UserGameState",
                column: "SelectedSkinID",
                principalTable: "GameSkin",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
