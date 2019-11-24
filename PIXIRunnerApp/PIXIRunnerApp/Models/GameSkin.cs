using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class GameSkin
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int Cost { get; set; }
        public int GameID { get; set; }
        public Game Game { get; set; }
    }
}
