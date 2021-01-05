const Campground = require('./models/Campground');
const Review = require('./models/Review');
const ExpressError = require('./utils/ExpressErrors');
const { campgroundSchema } = require('./validation.js');
const { reviewSchema } = require('./validation.js');

module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You need to be signed in.');
      return res.redirect('/login');
   } else {
      next();
   }
};

module.exports.isAuthor = async (req, res, next) => {
   const { id } = req.params;
   const campground = await Campground.findById(id);
   if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that.');
      return res.redirect(`/campgrounds/${id}`);
   }
   next();
};

module.exports.validateCampground = (req, _res, next) => {
   const { error } = campgroundSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else next();
};

module.exports.validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that.');
      return res.redirect(`/campgrounds/${id}`);
   }
   next();
};
