using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Models
{
    public class Review
    {
        public int ID { get; set; }
        public int Rating { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; }
        public string Text { get; set; }
        public string UserId { get; set; }
        public DateTime Date { get; set; }

    }
}
