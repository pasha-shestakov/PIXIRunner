using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PIXIRunnerApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PIXIRunnerApp.Controllers
{
    public class ReviewController : Controller
    {
        private readonly GameContext _context;

        public ReviewController(GameContext context)
        {
            this._context = context;
        }

        /// <summary>
        /// This method returns the review associated with the specified user and game.
        /// </summary>
        /// <param name="gameID">Game ID</param>
        /// <param name="userID">User ID</param>
        /// <returns></returns>
        public JsonResult GetReview(int gameID, string userID)
        {
            Review review = _context.Review.Where(r => r.UserId.Equals(userID) && r.GameId == gameID).FirstOrDefault();

            if (review != null)
            {
                return Json(new { success = true, text = review.Text, date = review.Date, rating = review.Rating });
            }
            else
            {
                // no review yet
                return Json(new { success = false });
            }
        }

        /// <summary>
        /// This method queries the Review table for all the reviews from the specfied game.
        /// </summary>
        /// <param name="gameID">Game ID</param>
        /// <returns></returns>
        public JsonResult GetGameReviews(int gameID)
        {
            List<Review> reviews = _context.Review.Where(r => r.GameId == gameID).ToList();

            if (reviews != null)
            {
                return Json(new { success = true, reviews = JsonConvert.SerializeObject(reviews) });
            }
            else
            {
                // no reviews yet
                return Json(new { success = false });
            }
        }

        /// <summary>
        /// This method sets the User's review for the sepcified game with the text, rating, and current time. 
        /// If there is no review it's created and added to the table, otherwise the existing review is altered.
        /// </summary>
        /// <param name="gameID">Game ID of the game</param>
        /// <param name="userID">User ID of the current user</param>
        /// <param name="text">The User's review of the game</param>
        /// <param name="rating">The User's rating of the game</param>
        /// <returns></returns>
        public JsonResult SetReview(int gameID, string userID, string text, int rating)
        {
            //We query the review table for the review from the specified user for the specified game
            Review review = _context.Review.Where(r => r.UserId.Equals(userID) && r.GameId == gameID).FirstOrDefault();
            DateTime time = DateTime.Now;

            if (review is null)
            {
                // create new 
                var newReview = new Review()
                {
                    Rating = rating,
                    GameId = gameID,
                    Text = text,
                    UserId = userID,
                    Date = time
                };
                _context.Review.Add(newReview);
                _context.SaveChanges();

                return Json(new { success = true, msg = "Sucessfully created review.", text = newReview.Text, date = newReview.Date, rating = newReview.Rating, reviewID = newReview.ID });
            }
            else
            {
                // alter existing review
                review.Rating = rating;
                review.Text = text;
                review.Date = time;
                _context.Review.Update(review);
                _context.SaveChanges();

                return Json(new { success = false, msg = "Sucessfully modified existing review.", text = review.Text, date = review.Date, rating = review.Rating, reviewID = review.ID });
            }
        }

        /// <summary>
        /// This method deletes the review from the specified user for the specified game.
        /// </summary>
        /// <param name="gameID">Game ID</param>
        /// <param name="userID">USer ID</param>
        /// <returns></returns>
        public JsonResult DeleteReview(int gameID, string userID)
        {
            //We query the review table for the review from the specified user for the specified game
            Review review = _context.Review.Where(r => r.UserId.Equals(userID) && r.GameId == gameID).FirstOrDefault();

            if (review != null)
            {
                _context.Review.Remove(review);
                _context.SaveChanges();
                return Json(new { success = true, msg = "Review was sucessfully deleted." });
            }
            else
            {
                // no review found
                return Json(new { success = false, msg = "The specified review was not found." });
            }
        }

    }
}
