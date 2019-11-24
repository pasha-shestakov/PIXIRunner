﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNet.Identity;
using System.Security.Principal;
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


        public JsonResult NewGame(int? id)
        {
            if (id == null) {
                //TODO: return bad request
                return null;
            }
            int gId = id ?? default(int);
            //TODO: Authorization and authentication
           var userID = User.Identity.GetUserId();

            var newSavedState = new SaveState() { gameID = gId, userID = userID, checkpoint = 0, character = 3, lives = 3 };
            _context.SaveState.Add(newSavedState);
            _context.SaveChanges();
            return new JsonResult(newSavedState);
        }
        public JsonResult SavedStates(int? id)
        {
            if (id == null)
            {
                //TODO: return bad request
                return null;
            }
            int sId = id ?? default(int);
            //TODO: Authorization and authentication
            var savedState = _context.SaveState.Where(s => s.saveStateID == sId).FirstOrDefault();
            return new JsonResult(savedState);
        }

        public IActionResult Index() {
            var games = _context.Game.ToList();
            return View(games);
        }

            // GET: Games
       public IActionResult GameView(int? id)
        {
            if (id == null)
            {
                //TODO: return bad request
                return null;
            }
            var game = _context.Game.Where(g => g.gameID == id).FirstOrDefault();
            var saves = _context.SaveState.Where(g => g.gameID == id).ToList();
            ViewData["saves"] = saves;
            if (game == null)
                return NotFound();
            else
                return View(game);
        }

        public JsonResult UserGameSettings(int? id) {
            if (id == null) {
                return null;
            }
            int gId = id ?? default(int);
            var userID = User.Identity.GetUserId();

            if (_context.UserGameSettings.Any(s => s.GameID == gId && s.UserID == userID)) {
                var gameSettings = _context.UserGameSettings.Where(s => s.GameID == gId && s.UserID == userID).FirstOrDefault();
                return Json(gameSettings);
            }
            var newGameSettings = new UserGameSettings() { GameID = gId, UserID = userID, MusicVolume = 50, SoundEffectVolume = 50, SoundEnabled = true };
            _context.UserGameSettings.Add(newGameSettings);
            _context.SaveChangesAsync();
            return Json(newGameSettings);

        }

        public JsonResult UpdateGameSettings([Bind("SoundEnabled,MusicVolume,SoundEffectVolume")] UserGameSettings userGameSettings) {
            return Json("");
        }
    }
}