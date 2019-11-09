using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PIXIRunnerApp.Controllers
{
    public class GameController : Controller
    {

        public GameController()
        {

        }

        public IActionResult Index(int? id)
        {
            return View(id);
        }
    }
}