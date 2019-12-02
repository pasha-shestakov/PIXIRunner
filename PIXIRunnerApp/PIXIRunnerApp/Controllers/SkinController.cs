using Microsoft.AspNetCore.Mvc;
using PIXIRunnerApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Controllers
{
    public class SkinController : Controller
    {
        private readonly GameContext _context;

        public SkinController(GameContext context)
        {
            this._context = context;
        }

        public JsonResult GetAvailableSkins(int ID)
        {
            //here ID refers to the userGameStateID

            //We query the intermediate table UserUnlockedSkins to find each entry where our userGameStateID equals the one provided by the request
            //we then join on the skins table where the skinIDs match.
            var skins = from unlocked in _context.UserUnlockedSkins
                        where unlocked.userGameStateID == ID
                        join sk in _context.GameSkin
                        on unlocked.skinID equals sk.ID
                        select sk;

            //return a JSON array of all skins available.
            return Json(skins.ToArray());
        }

        public JsonResult SelectSkin(int userGameStateID, int skinID)
        {
            var gamestate = _context.UserGameState.Where(ugs => ugs.ID == userGameStateID).FirstOrDefault();
            var unlockedSkin = _context.UserUnlockedSkins.Where(us => us.userGameStateID == userGameStateID && us.skinID == skinID).FirstOrDefault();
            if (gamestate != null && unlockedSkin != null)
            {
                return Json(new { success = true, msg = "Selected Skin is now " + skinID, id=skinID });
            }
            else if (gamestate == null)
                return Json(new { success = false, msg = "The gamestate specified by your request does not exist." });
            else if (unlockedSkin == null)
                return Json(new { success = false, msg = "You cannot select a skin you do not own!" });
            else
                return Json(new { success = false, msg = "An unknown error has occured." });

        }


        public JsonResult UnlockSkin(int userGameStateID, int skinID, int gameID)
        {
            if (!_context.UserUnlockedSkins.Any(us => us.userGameStateID == userGameStateID && us.skinID == skinID))
            {
                UserGameState ugs = _context.UserGameState.Where(state => state.ID == userGameStateID).FirstOrDefault();
                GameSkin skin = _context.GameSkin.Where(sk => sk.ID == skinID && sk.GameID == gameID).FirstOrDefault();

                if (ugs != null && skin != null && ugs.Gold >= skin.Cost)
                {
                    //part 1 unlock that skin for the user
                    UserUnlockedSkins unlocked = new UserUnlockedSkins();
                    unlocked.userGameStateID = userGameStateID;
                    unlocked.skinID = skinID;
                    _context.UserUnlockedSkins.Add(unlocked);
                    _context.SaveChanges();

                    //part 2 we update the remaining gold inside the game_controller.
                    ugs.Gold -= skin.Cost;
                    return Json(new { success = true, goldRemaining=ugs.Gold });
                }
                else if (ugs == null)
                    return Json(new { success = false, msg = "The gamestate associated with your request does not exist." });
                else if (skin == null)
                    return Json(new { success = false, msg = "The skin you selected was not valid." });
                else if (ugs.Gold < skin.Cost)
                    return Json(new { success = false, msg = "You do not have enough gold to purchase this skin." });
                else
                    return Json(new { success = false, msg = "An unexpected error has occured." });
                }
            else
                return Json(new { success = false, msg = "You already own that skin." });
            
        }


    }
}
