if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');
const db = mongoose.connection;
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressErrors');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/User');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { contentSecurityPolicy } = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo')(session);

// DB connect
mongoose.connect(dbUrl, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

// Session
const secret = process.env.SECRET || 'devsecret';
const oneWeek = 1000 * 60 * 60 * 24 * 7;
const store = new MongoStore({
   url: dbUrl,
   secret: secret,
   touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
   console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
   store,
   name: 'session',
   secret: secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + oneWeek,
      maxAge: oneWeek,
   },
};
app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash
app.use(flash());
app.use((req, res, next) => {
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

// Routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Default routes
app.get('/', (_req, res) => {
   res.render('home');
});

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
