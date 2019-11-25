using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class UserGameState
    {
        public int ID { get; set; }
        public int GameId { get; set; }
        public string UserID { get; set; }
        public int Gold { get; set; }
        public int AmmoAmount { get; set; }
        public GameSkin SelectedSkin { get; set; }
        public ICollection<GameSkin> UnlockedSkins { get; set; }
        public int MinutesPlayed { get; set; }
        public int Checkpoint { get; set; }
    }
}
