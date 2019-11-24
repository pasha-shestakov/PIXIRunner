using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class Review
    {
        public int Rating { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; }
        public string Text { get; set; }
        public int UserId { get; set; }
        public DateTime Date { get; set; }

    }
}
