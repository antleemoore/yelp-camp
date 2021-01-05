const Campground = require('../models/Campground');
const catchAsync = require('../utils/catchAsync');

module.exports.index = catchAsync(async (_req, res) => {
   const campgrounds = await Campground.find({});
   res.render('campgrounds/index', { campgrounds });
});
module.exports.renderNewForm = (_req, res) => {
   res.render('campgrounds/new');
};
module.exports.newCampground = catchAsync(async (req, res, _next) => {
   const campground = new Campground(req.body.campground);
   campground.author = req.user._id;
   await campground.save();
   req.flash('success', 'Successfully created a new campground!');
   res.redirect(`/campgrounds/${campground._id}`);
});
module.exports.showCampground = catchAsync(async (req, res) => {
   const campground = await Campground.findById(req.params.id)
      .populate({
         path: 'reviews',
         populate: {
            path: 'author',
         },
      })
      .populate('author');
   if (!campground) {
      req.flash('error', 'Cannot find campground.');
      return res.redirect('/campgrounds');
   }
   res.render('campgrounds/show', { campground });
});
module.exports.renderEditForm = catchAsync(async (req, res) => {
   const campground = await Campground.findById(req.params.id);
   if (!campground) {
      req.flash('error', 'Cannont find campground.');
      return res.redirect('/campgrounds');
   }
   res.render('campgrounds/edit', { campground });
});
module.exports.editCampground = catchAsync(async (req, res) => {
   const { id } = req.params;
   const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
   });
   req.flash('success', 'Successfully updated campground!');
   res.redirect(`/campgrounds/${campground._id}`);
});
module.exports.deleteCampground = catchAsync(async (req, res) => {
   const { id } = req.params;
   await Campground.findByIdAndDelete(id);
   req.flash('success', 'Successfully deleted campground!');
   res.redirect('/campgrounds');
});
