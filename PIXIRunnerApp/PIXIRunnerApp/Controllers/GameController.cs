using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIXIRunnerApp.Models;

namespace PIXIRunnerApp.Controllers
{
    public class GameController : Controller
    {

        private readonly GameContext _context;

        public GameController(GameContext context)
        {
            _context = context;
        }

        // GET: Games
        public IActionResult Index(int? id)
        {
            var game = _context.Game.Where(g => g.gameID == id).FirstOrDefault();

            if (game == null)
                return NotFound();
            else
                return View(game);
        }
    }
}