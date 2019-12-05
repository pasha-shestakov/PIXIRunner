using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class UserUnlockedSkins
    {
        public int ID { get; set; }

        //foreign key linking UserGameState to GameSkin
        public int userGameStateID { get; set; }

        public int skinID { get; set; }
    }
}
