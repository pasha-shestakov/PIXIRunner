﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PIXIRunnerApp.Models;

namespace PIXIRunnerApp.Migrations.Game
{
    [DbContext(typeof(GameContext))]
    [Migration("20191119233124_Games-Description-Col")]
    partial class GamesDescriptionCol
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
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

            modelBuilder.Entity("PIXIRunnerApp.Models.SaveState", b =>
                {
                    b.Property<int>("saveStateID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("character");

                    b.Property<int>("checkpoint");

                    b.Property<int>("gameID");

                    b.Property<int>("lives");

                    b.Property<string>("userID");

                    b.HasKey("saveStateID");

                    b.ToTable("SaveState");
                });
#pragma warning restore 612, 618
        }
    }
}