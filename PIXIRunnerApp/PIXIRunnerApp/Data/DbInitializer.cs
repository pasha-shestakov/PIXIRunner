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
                new Game{ name="Pixel Runner" }
            };
            foreach (Game g in games)
            {
                gameContext.Game.Add(g);
            }
            gameContext.SaveChanges();

            //we seed all users with some save state.
            foreach (string userID in userIDs)
            {
                gameContext.SaveState.Add(new SaveState { gameID = 1, userID = userID, checkpoint=0, lives=3, character=3 });
            }
            gameContext.SaveChanges();
}
    }
}
