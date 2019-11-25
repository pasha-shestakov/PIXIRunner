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
        public string UserID { get; set; }
        public float MusicVolume { get; set; }
        public float SoundEffectVolume { get; set; }
        public bool SoundDisabled { get; set; }
        public Game Game { get; set; }
    }
}
