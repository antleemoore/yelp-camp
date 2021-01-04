const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/Review');
const Campground = require('../models/Campground');
const { isLoggedIn, validateReview } = require('../middleware');

router.post(
   '/',
   isLoggedIn,
   validateReview,
   catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      const review = new Review(req.body.review);
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      req.flash('success', 'New review created!');
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

router.delete(
   '/:reviewId',
   isLoggedIn,
   catchAsync(async (req, res, next) => {
      const { id, reviewId } = req.params;
      Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash('success', 'Review successfully deleted!');
      res.redirect(`/campgrounds/${id}`);
   })
);

module.exports = router;
