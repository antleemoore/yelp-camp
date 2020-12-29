const mongoose = require('mongoose'),
   cities = require('./cities'),
   { places, descriptors } = require('./seedHelpers'),
   Campground = require('../models/Campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
   await Campground.deleteMany({});
   for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
         location: `${cities[random1000].city}, ${cities[random1000].state}`,
         title: `${sample(descriptors)} ${sample(places)}`,
         image: 'https://source.unsplash.com/collection/483251',
         description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt inventore, nulla dolorem numquam ipsa neque nobis fugit esse ad doloremque, itaque soluta ipsum a minima voluptatum officiis reprehenderit, sint eaque.',
         price,
      });
      await camp.save();
   }
};

seedDB().then(() => {
   mongoose.connection.close();
});
