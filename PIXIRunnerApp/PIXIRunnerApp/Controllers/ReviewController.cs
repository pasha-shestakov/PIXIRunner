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

        public JsonResult GetReview(int gameID, string userID)
        {
            //We query the review table for the review from the specified user for the specified game
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

        public JsonResult GetGameReviews(int gameID)
        {
            //We query the review table for the review from the specified user for the specified game
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

        [Authorize(Roles = "admin")]
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
