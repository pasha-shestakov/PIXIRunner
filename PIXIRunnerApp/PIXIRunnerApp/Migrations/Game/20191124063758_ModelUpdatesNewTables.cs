using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PIXIRunnerApp.Migrations.Game
{
    public partial class ModelUpdatesNewTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Review",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Rating = table.Column<int>(nullable: false),
                    GameId = table.Column<int>(nullable: false),
                    Text = table.Column<string>(nullable: true),
                    UserId = table.Column<int>(nullable: false),
                    Date = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Review", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Review_Game_GameId",
                        column: x => x.GameId,
                        principalTable: "Game",
                        principalColumn: "gameID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserGameSettings",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    GameID = table.Column<int>(nullable: false),
                    UserID = table.Column<int>(nullable: false),
                    MusicVolume = table.Column<int>(nullable: false),
                    SoundEffectVolume = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGameSettings", x => x.ID);
                    table.ForeignKey(
                        name: "FK_UserGameSettings_Game_GameID",
                        column: x => x.GameID,
                        principalTable: "Game",
                        principalColumn: "gameID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserGameState",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    GameId = table.Column<int>(nullable: false),
                    UserID = table.Column<int>(nullable: false),
                    Gold = table.Column<int>(nullable: false),
                    AmmoAmount = table.Column<int>(nullable: false),
                    SelectedSkinId = table.Column<int>(nullable: false),
                    MinutesPlayed = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGameState", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "GameSkin",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: true),
                    Cost = table.Column<int>(nullable: false),
                    GameID = table.Column<int>(nullable: false),
                    UserGameStateID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameSkin", x => x.ID);
                    table.ForeignKey(
                        name: "FK_GameSkin_Game_GameID",
                        column: x => x.GameID,
                        principalTable: "Game",
                        principalColumn: "gameID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameSkin_UserGameState_UserGameStateID",
                        column: x => x.UserGameStateID,
                        principalTable: "UserGameState",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameSkin_GameID",
                table: "GameSkin",
                column: "GameID");

            migrationBuilder.CreateIndex(
                name: "IX_GameSkin_UserGameStateID",
                table: "GameSkin",
                column: "UserGameStateID");

            migrationBuilder.CreateIndex(
                name: "IX_Review_GameId",
                table: "Review",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGameSettings_GameID",
                table: "UserGameSettings",
                column: "GameID");

            migrationBuilder.CreateIndex(
                name: "IX_UserGameState_SelectedSkinId",
                table: "UserGameState",
                column: "SelectedSkinId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGameState_GameSkin_SelectedSkinId",
                table: "UserGameState",
                column: "SelectedSkinId",
                principalTable: "GameSkin",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GameSkin_UserGameState_UserGameStateID",
                table: "GameSkin");

            migrationBuilder.DropTable(
                name: "Review");

            migrationBuilder.DropTable(
                name: "UserGameSettings");

            migrationBuilder.DropTable(
                name: "UserGameState");

            migrationBuilder.DropTable(
                name: "GameSkin");
        }
    }
}
