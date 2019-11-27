﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PIXIRunnerApp.Models;

namespace PIXIRunnerApp.Migrations.Game
{
    [DbContext(typeof(GameContext))]
    partial class GameContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("PIXIRunnerApp.Models.Game", b =>
                {
                    b.Property<int>("gameID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("discription");

                    b.Property<string>("name");

                    b.HasKey("gameID");

                    b.ToTable("Game");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.GameSkin", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("Cost");

                    b.Property<int>("GameID");

                    b.Property<string>("Name");

                    b.Property<int?>("UserGameStateID");

                    b.HasKey("ID");

                    b.HasIndex("GameID");

                    b.HasIndex("UserGameStateID");

                    b.ToTable("GameSkin");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.Review", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("Date");

                    b.Property<int>("GameId");

                    b.Property<int>("Rating");

                    b.Property<string>("Text");

                    b.Property<string>("UserId");

                    b.HasKey("ID");

                    b.HasIndex("GameId");

                    b.ToTable("Review");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.SaveState", b =>
                {
                    b.Property<int>("saveStateID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("checkpoint");

                    b.Property<int>("gameID");

                    b.Property<int>("lives");

                    b.Property<int>("maxLives");

                    b.Property<string>("userID");

                    b.HasKey("saveStateID");

                    b.ToTable("SaveState");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.UserGameSettings", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("GameID");

                    b.Property<float>("MusicVolume");

                    b.Property<bool>("SoundDisabled");

                    b.Property<float>("SoundEffectVolume");

                    b.Property<string>("UserID");

                    b.HasKey("ID");

                    b.HasIndex("GameID");

                    b.ToTable("UserGameSettings");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.UserGameState", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AmmoAmount");

                    b.Property<int>("GameId");

                    b.Property<int>("Gold");

                    b.Property<int>("MinutesPlayed");

                    b.Property<int?>("SelectedSkinID");

                    b.Property<string>("UserID");

                    b.HasKey("ID");

                    b.HasIndex("SelectedSkinID");

                    b.ToTable("UserGameState");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.GameSkin", b =>
                {
                    b.HasOne("PIXIRunnerApp.Models.Game", "Game")
                        .WithMany()
                        .HasForeignKey("GameID")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("PIXIRunnerApp.Models.UserGameState")
                        .WithMany("UnlockedSkins")
                        .HasForeignKey("UserGameStateID");
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.Review", b =>
                {
                    b.HasOne("PIXIRunnerApp.Models.Game", "Game")
                        .WithMany()
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.UserGameSettings", b =>
                {
                    b.HasOne("PIXIRunnerApp.Models.Game", "Game")
                        .WithMany()
                        .HasForeignKey("GameID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("PIXIRunnerApp.Models.UserGameState", b =>
                {
                    b.HasOne("PIXIRunnerApp.Models.GameSkin", "SelectedSkin")
                        .WithMany()
                        .HasForeignKey("SelectedSkinID");
                });
#pragma warning restore 612, 618
        }
    }
}
