const Campground = require('../models/Campground');
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require('../cloudinaryConfig');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const mongoose = require('mongoose');
const paginate = require('paginate')({ mongoose });

module.exports.index = catchAsync(async (req, res) => {
   const allCampgrounds = await Campground.find({});
   await Campground.find({}).paginate(
      { page: req.query.page },
      function (err, campgrounds) {
         let page = !req.query.page ? 1 : req.query.page;
         res.render('campgrounds/index', { campgrounds, allCampgrounds, page });
      }
   );
});
module.exports.renderNewForm = (_req, res) => {
   res.render('campgrounds/new');
};
module.exports.newCampground = catchAsync(async (req, res, _next) => {
   const geoData = await geocoder
      .forwardGeocode({
         query: req.body.campground.location,
         limit: 1,
      })
      .send();
   const campground = new Campground(req.body.campground);
   campground.geometry = geoData.body.features[0].geometry;
   campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
   res.render('campgrounds/show', { campground, req });
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
   const imgs = req.files.map(f => ({
      url: f.path,
      filename: f.filename,
   }));
   campground.images.push(...imgs);
   await campground.save();
   if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
         await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
         $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
   }
   req.flash('success', 'Successfully updated campground!');
   res.redirect(`/campgrounds/${campground._id}`);
});
module.exports.deleteCampground = catchAsync(async (req, res) => {
   const { id } = req.params;
   await Campground.findByIdAndDelete(id);
   req.flash('success', 'Successfully deleted campground!');
   res.redirect('/campgrounds');
});
module.exports.searchCampgrounds = catchAsync(async (req, res) => {
   const { search } = req.query;
   if (search === '') {
      res.redirect('/campgrounds');
   }
   const results = await Campground.find({
      $or: [
         { title: { $regex: new RegExp(search, 'i') } },
         { location: { $regex: new RegExp(search, 'i') } },
      ],
   });
   res.render('campgrounds/search', { results, search });
});
