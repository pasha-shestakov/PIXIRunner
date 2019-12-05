using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Principal;
using Microsoft.AspNetCore.Mvc;
using PIXIRunnerApp.Models;
using Microsoft.AspNetCore.Identity;

namespace PIXIRunnerApp.Controllers
{
    [Authorize]
    public class GameController : Controller
    {
        private readonly GameContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public GameController(GameContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        public JsonResult NewGame(int? id)
        {
            if (id == null)
            {
                //TODO: return bad request
                return null;
            }
            int gId = id ?? default(int);
            //TODO: Authorization and authentication
            var userID = _userManager.GetUserId(User);

            var newSavedState = new SaveState() { gameID = gId, userID = userID, checkpoint = 0, lives = 4, maxLives = 4 };
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

        public IActionResult Index()
        {
            var games = _context.Game.ToList();
            return View(games);
        }

        // GET: Games
        [Authorize]
        public IActionResult GameView(int? id)
        {

            if (id == null)
            {
                //TODO: return bad request
                return null;
            }
            else
            {
                var userID = _userManager.GetUserId(User);
                var game = _context.Game.Where(g => g.gameID == id).FirstOrDefault();
                var saves = _context.SaveState.Where(g => g.gameID == id && g.userID == userID).ToList();
                ViewData["saves"] = saves;
                if (game == null)
                    return NotFound();
                else
                    return View(game);
            }

        }

        /**
         * UserGameSettings returns the serialized UserGameSetting object that matches id. If one doesn't exist, it is created.
         */
        public JsonResult UserGameSettings(int? id)
        {

            if (id == null)
            {
                return null;
            }

            int gId = id ?? default(int);
            var userID = _userManager.GetUserId(User);

            if (_context.UserGameSettings.Any(s => s.GameID == gId && s.UserID == userID))
            {
                var gameSettings = _context.UserGameSettings.Where(s => s.GameID == gId && s.UserID == userID).FirstOrDefault();
                return Json(gameSettings);
            }
            var newGameSettings = new UserGameSettings() { GameID = gId, UserID = userID, MusicVolume = .5F, SoundEffectVolume = .5F, SoundDisabled = false };
            _context.UserGameSettings.Add(newGameSettings);
            _context.SaveChangesAsync();
            return Json(newGameSettings);

        }

        /**
         * UpdateUserGameSettings updates the record in the database with the supplied arguments. If a record doesn't exist
         * should return bad request.
         * Can somehow bind params to a Object, but not sure how that works so leaving like this.
         */
        public JsonResult UpdateUserGameSettings(int id, bool soundDisabled, float musicVolume, float soundEffectVolume)
        {
            if (_context.UserGameSettings.Any(s => s.ID == id))
            {
                var setting = _context.UserGameSettings.Where(s => s.ID == id).FirstOrDefault();
                setting.SoundDisabled = soundDisabled;
                setting.MusicVolume = musicVolume;
                setting.SoundEffectVolume = soundEffectVolume;
                _context.UserGameSettings.Update(setting);
                _context.SaveChanges();
                return Json(setting);
            }
            return null;
        }

        /**
         * UserGameState returns the serialized UserGameState object that matches id. If one doesn't exist, it is created.
         */
        public JsonResult UserGameState(int? id)
        {
            if (id == null)
            {
                return null;
            }
            int gId = id ?? default(int);
            var userID = _userManager.GetUserId(User);
            var gameState = _context.UserGameState.Where(s => s.GameId == gId && s.UserID == userID).FirstOrDefault();
            if (gameState != null)
            {
                return Json(gameState);
            } else
            {
                //user has not played this game before, we need to set up some default data for them.

                //default selected skin for a user who hasn't ever played this game.
                var selectedSkin = _context.GameSkin.Where(skin => skin.Name == "Pink Monster" && skin.GameID == gId).FirstOrDefault();

                
                //create new gamestate for new user.
                var newGameState = new UserGameState()
                {
                    GameId = gId,
                    UserID = userID,
                    Gold = 0,
                    AmmoAmount = 30,
                    SelectedSkinID = selectedSkin.ID,
                    MinutesPlayed = 0
                };
                _context.UserGameState.Add(newGameState);
                _context.SaveChanges();

                //add default selected skin to unlocked skins for new user.
                _context.UserUnlockedSkins.Add(new UserUnlockedSkins { userGameStateID = newGameState.ID, skinID = selectedSkin.ID });
                _context.SaveChanges();

                return Json(newGameState);
            }
            

        }
        //
        public JsonResult UpdateSaveState(int saveStateID, string gameID, int userID, int checkpoint, int lives, int maxLives)
        {
            var saveState = _context.SaveState.Where(s => s.saveStateID == saveStateID).FirstOrDefault();
            if (saveState != null)
            {
                saveState.lives = lives;
                saveState.maxLives = maxLives;
                saveState.checkpoint = checkpoint;

                _context.SaveChanges();
                return Json(saveState);

            }
            return null;
        }

        /**
         * Updates the UserGameState record that matches passed id. This function can be changed to use ids instead of objects. 
         */
        public JsonResult UpdateUserGameState(int id, int gold, int ammoAmount, int selectedSkinID, int minutesPlayed)
        {
            UserGameState gameState = _context.UserGameState.Where(s => s.ID == id).FirstOrDefault();

            if (gameState != null)
            {
                gameState.Gold = gold;
                gameState.AmmoAmount = ammoAmount;
                gameState.SelectedSkinID = selectedSkinID;
                gameState.MinutesPlayed = minutesPlayed;

                _context.SaveChanges();
                return Json(gameState);
            }
            return null;
        }
    }
}