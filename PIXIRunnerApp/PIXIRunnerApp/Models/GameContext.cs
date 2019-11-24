using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace PIXIRunnerApp.Models
{
    public class GameContext : DbContext
    {
        public GameContext (DbContextOptions<GameContext> options)
            : base(options)
        {
        }

        public DbSet<Game> Game { get; set; }
        public DbSet<SaveState> SaveState { get; set; }
        public DbSet<Review> Review { get; set; }
        public DbSet<UserGameState> UserGameState { get; set; }
        public DbSet<UserGameSettings> UserGameSettings { get; set; }

    }
}
