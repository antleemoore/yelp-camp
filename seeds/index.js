const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/Campground');

mongoose.connect(process.env.DB_URL, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
   await Campground.deleteMany({});
   for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
         author: '5ff11ebffe0cfb2169690678',
         location: `${cities[random1000].city}, ${cities[random1000].state}`,
         title: `${sample(descriptors)} ${sample(places)}`,
         images: [{ url: 'https://source.unsplash.com/collection/483251' }],
         description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt inventore, nulla dolorem numquam ipsa neque nobis fugit esse ad doloremque, itaque soluta ipsum a minima voluptatum officiis reprehenderit, sint eaque.',
         price,
         geometry: {
            type: 'Point',
            coordinates: [-113.1331, 47.0202],
         },
      });
      await camp.save();
   }
};

seedDB().then(() => {
   mongoose.connection.close();
});
