const express = require('express'),
   app = express(),
   port = 3000,
   path = require('path'),
   mongoose = require('mongoose'),
   db = mongoose.connection,
   Campground = require('./models/Campground'),
   methodOverride = require('method-override'),
   morgan = require('morgan'),
   ejsMate = require('ejs-mate'),
   catchAsync = require('./utils/catchAsync'),
   ExpressError = require('./utils/ExpressErrors'),
   { campgroundSchema } = require('./validation.js');

// DB connect
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('db connected');
});

// Rendering
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const validateCampground = (req, _res, next) => {
   const { error } = campgroundSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else next();
};

// GET routes
app.get('/', (_req, res) => {
   res.render('home');
});
app.get(
   '/campgrounds',
   catchAsync(async (_req, res) => {
      const campgrounds = await Campground.find({});
      res.render('campgrounds/index', { campgrounds });
   })
);
app.get('/campgrounds/new', (_req, res) => {
   res.render('campgrounds/new');
});
app.get(
   '/campgrounds/:id',
   catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render('campgrounds/show', { campground });
   })
);
app.get(
   '/campgrounds/:id/edit',
   catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render('campgrounds/edit', { campground });
   })
);

// POST routes
app.post(
   '/campgrounds',
   validateCampground,
   catchAsync(async (req, res, _next) => {
      const campground = new Campground(req.body.campground);
      await campground.save();
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

// PUT routes
app.put(
   '/campgrounds/:id',
   validateCampground,
   catchAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {
         ...req.body.campground,
      });
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//DELETE routes
app.delete(
   '/campgrounds/:id',
   catchAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      res.redirect('/campgrounds');
   })
);

app.all('*', (_req, _res, next) => {
   next(new ExpressError('Page Not Found', 404));
});

// Error Handling
app.use((err, _req, res, _next) => {
   const { status = 500 } = err;
   if (status === 404) res.status(status).render('404');
   else res.status(status).render('error', { err });
});

// Port Listen
app.listen(port, () => {
   console.log(`Listening to port: ${port}`);
});
