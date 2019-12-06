using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PIXIRunnerApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Data
{
    public class DbInitializer
    {

        public static List<string> SeedUsers(UserContext userContext, UserManager<IdentityUser> userManager)
        {
            List<string> userIDs = new List<string>();
            userContext.Database.Migrate();

            //default admin user
            if (userManager.FindByEmailAsync("admin@email.com").Result == null)
            {
                IdentityUser user = new IdentityUser
                {
                    UserName = "admin",
                    Email = "admin@email.com"
                };


                IdentityResult result = userManager.CreateAsync(user, "password").Result;

                if (result.Succeeded)
                {
                    Console.WriteLine("successfully seeded user");
                    userIDs.Add(user.Id);
                }
            }

            if (userManager.FindByEmailAsync("player1@email.com").Result == null)
            {
                IdentityUser user = new IdentityUser
                {
                    UserName = "player1",
                    Email = "player1@email.com"
                };


                IdentityResult result = userManager.CreateAsync(user, "password").Result;

                if (result.Succeeded)
                {
                    Console.WriteLine("successfully seeded user");
                    userIDs.Add(user.Id);
                }
            }

            if (userManager.FindByEmailAsync("player2@email.com").Result == null)
            {
                IdentityUser user = new IdentityUser
                {
                    UserName = "player2",
                    Email = "player2@email.com"
                };


                IdentityResult result = userManager.CreateAsync(user, "password").Result;

                if (result.Succeeded)
                {
                    Console.WriteLine("successfully seeded user");
                    userIDs.Add(user.Id);
                }
            }


            return userIDs;
        }

        public static void SeedSaveState(GameContext gameContext, List<string> userIDs)
        {
            gameContext.Database.Migrate();
            // Look for any games.
            if (gameContext.Game.Any())
            {
                return;   // DB has been seeded
            }

            var games = new Game[]
            {
                new Game{ name="Pixel Runner", discription="Pixel Runner is a 2D platformer. Explore the dark and mysterious castle " +
                "and uncover it's dark secrets. But beware the castle is home to several not so friendly skeletons. Collect as much gold as you can and unlock new skins as you play!" },
                new Game{ name="Pixel Sprinter", discription="Pixel Sprinter, based on Pixel Runner, is an arcade gamemode where you race against the clock to collect as many coins as possible. " +
                "Compete against other users to claim bragging rights on the leaderboard" }
            };
            foreach (Game g in games)
            {
                gameContext.Game.Add(g);
                gameContext.SaveChanges();
                gameContext.GameSkin.Add(new GameSkin() { Name = "Pink Monster", Cost = 0, GameID = g.gameID }); //added default skin for each game.
                gameContext.GameSkin.Add(new GameSkin() { Name = "Dude Monster", Cost = 10, GameID = g.gameID }); //added default skin for each game.
                gameContext.GameSkin.Add(new GameSkin() { Name = "Owlet Monster", Cost = 20, GameID = g.gameID }); //added default skin for each game.
                gameContext.SaveChanges();
            }

            for (int i = 0; i < userIDs.Count; i++)
            {
                gameContext.SaveState.Add(new SaveState { gameID = 1, userID = userIDs[i], checkpoint = 0, lives = 4, maxLives = 4 });
                gameContext.SaveChanges();
                gameContext.UserGameState.Add(new UserGameState { GameId = 1, AmmoAmount = 40, Gold = 0, MinutesPlayed = 200, SelectedSkinID = 1, UserID = userIDs[i] });
                gameContext.SaveChanges();
                //unlocks the first skin by default for admin user
                gameContext.UserUnlockedSkins.Add(new UserUnlockedSkins { userGameStateID = 1, skinID = 1 });
                gameContext.SaveChanges();

                // leave admin without review
                if (i == 1)
                {
                    gameContext.Review.Add(new Review { Date = DateTime.Now, GameId = 1, Rating = 5, Text = "<h3><em>I love this game so much! I tell all my friends to play it.</em></h3>", UserId = userIDs[i] });
                    gameContext.SaveChanges();
                }
                if (i == 2)
                {
                    gameContext.Review.Add(new Review { Date = DateTime.Now, GameId = 1, Rating = 5, Text = "<h1>This is the best game ever! :D</h1>", UserId = userIDs[i] });
                    gameContext.SaveChanges();
                }
            }

            //we seed all users with some save state.
            //foreach (string userID in userIDs)
            //{
            //    gameContext.SaveState.Add(new SaveState { gameID = 1, userID = userID, checkpoint = 0, lives = 4, maxLives = 4 });
            //    gameContext.SaveChanges();
            //    gameContext.UserGameState.Add(new UserGameState { GameId = 1, AmmoAmount = 40, Gold = 0, MinutesPlayed = 200, SelectedSkinID = 1, UserID = userID });
            //    gameContext.SaveChanges();
            //    unlocks the first skin by default for admin user
            //    gameContext.UserUnlockedSkins.Add(new UserUnlockedSkins { userGameStateID = 1, skinID = 1 });
            //    gameContext.SaveChanges();
            //    gameContext.Review.Add(new Review { Date = DateTime.Now, GameId = 1, Rating = 5, Text = "I love this game so much!", UserId = userID });
            //    gameContext.SaveChanges();
            //}

        }
    }
}
