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
                new Game{ name="Pixel Runner", discription="Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
                "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
                "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
                new Game{ name="Pixel Sprinter", discription="At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas" +
                " molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga." }
            };
            foreach (Game g in games)
            {
                gameContext.Game.Add(g);
                gameContext.SaveChanges();
                gameContext.GameSkin.Add(new GameSkin() { Name = "Pink Monster", Cost = 0, GameID = g.gameID }); //added default skin for each game.
                gameContext.GameSkin.Add(new GameSkin() { Name = "Dude Monster", Cost = 100, GameID = g.gameID }); //added default skin for each game.
                gameContext.GameSkin.Add(new GameSkin() { Name = "Owlet Monster", Cost = 200, GameID = g.gameID }); //added default skin for each game.
                gameContext.SaveChanges();
            }

            //we seed all users with some save state.
            foreach (string userID in userIDs)
            {
                gameContext.SaveState.Add(new SaveState { gameID = 1, userID = userID, checkpoint = 0, lives = 4, maxLives = 4 });
                gameContext.SaveChanges();
                gameContext.UserGameState.Add(new UserGameState { GameId = 1, AmmoAmount = 40, Gold = 200, MinutesPlayed = 200, SelectedSkinID = 1, UserID = userID });
                gameContext.SaveChanges();
                //unlocks the first two skins by default for admin user
                gameContext.UserUnlockedSkins.Add(new UserUnlockedSkins { userGameStateID = 1, skinID = 1 });
                gameContext.UserUnlockedSkins.Add(new UserUnlockedSkins { userGameStateID = 1, skinID = 2 });
                gameContext.SaveChanges();
            }
            
}
    }
}
