using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class UserGameSettings
    {
        public int ID { get; set; }
        public int GameID { get; set; }
        public int MusicVolume { get; set; }
        public int SoundEffectVolume { get; set; }
        public Game Game { get; set; }
    }
}
