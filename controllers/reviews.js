const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/Campground');

module.exports.postReview = catchAsync(async (req, res) => {
   const campground = await Campground.findById(req.params.id);
   const review = new Review(req.body.review);
   review.author = req.user;
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   req.flash('success', 'New review created!');
   res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.deleteReview = catchAsync(async (req, res, next) => {
   const { id, reviewId } = req.params;
   Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
   await Review.findByIdAndDelete(reviewId);
   req.flash('success', 'Review successfully deleted!');
   res.redirect(`/campgrounds/${id}`);
});
