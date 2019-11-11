using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class SaveState
    {
        public int saveStateID { get; set; }

        public int gameID { get; set; }

        public string userID { get; set; }

        public int checkpoint { get; set; }
        public int lives { get; set; }
        public int character { get; set; }
    }
}
