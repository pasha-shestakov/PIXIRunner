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

        public static void SeedUsers(UserContext userContext, UserManager<IdentityUser> userManager)
        {
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
                }
            }
        }
    }
}
