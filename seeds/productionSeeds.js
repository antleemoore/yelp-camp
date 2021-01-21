const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Campground = require('../models/Campground');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const fetch = require('node-fetch');
const parser = require('xml2json');
const states = require('./data');

mongoose.connect(dbUrl, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('Database connected');
});

const seedDB = async () => {
   Campground.deleteMany({});
   for (state of states) {
      try {
         await fetch(
            `http://api.amp.active.com/camping/campgrounds/?pstate=${state.Code}&api_key=${process.env.CAMP_API_KEY}`
         )
            .then(response => response.text())
            .then(data => parser.toJson(data, { object: true }))
            .then(results => {
               let campgrounds = [];
               for (campground of results.resultset.result) {
                  const { pstate } = results.resultset;
                  const {
                     facilityName,
                     faciltyPhoto,
                     latitude,
                     longitude,
                     sitesWithAmps,
                     sitesWithPetsAllowed,
                     sitesWithSewerHookup,
                     sitesWithWaterHookup,
                     sitesWithWaterfront,
                  } = campground;
                  if (longitude < -169.700724 || longitude > -52.454636) continue;
                  if (latitude < 23.477506 || latitude > 71.990591) continue;
                  const seedCG = {
                     location: state.State,
                     title: facilityName,
                     images: [
                        { url: `https://www.reserveamerica.com${faciltyPhoto}` },
                     ],
                     geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                     },
                     description: createDescription(
                        sitesWithAmps,
                        sitesWithPetsAllowed,
                        sitesWithSewerHookup,
                        sitesWithWaterHookup,
                        sitesWithWaterfront
                     ),
                  };
                  campgrounds.push(seedCG);
               }
               saveCampgrounds(campgrounds);
            });
      } catch {}
   }
};
async function saveCampgrounds(c) {
   try {
      await Campground.insertMany(c);
   } catch {}
}
function createDescription(
   sitesWithAmps,
   sitesWithPetsAllowed,
   sitesWithSewerHookup,
   sitesWithWaterHookup,
   sitesWithWaterfront
) {
   const string = `Do the campsites have amps? ${
      sitesWithAmps === 'Y' ? 'Yes' : 'No'
   }.  Are pets allowed? ${
      sitesWithPetsAllowed === 'Y' ? 'Yes' : 'No'
   }.  Do the campsites have sewer hookup? ${
      sitesWithSewerHookup === 'Y' ? 'Yes' : 'No'
   }.  Do the campsites have water hookup? ${
      sitesWithWaterHookup === 'Y' ? 'Yes' : 'No'
   }.  ${
      sitesWithWaterfront === ''
         ? ''
         : `This campsite is on a ${sitesWithWaterfront}\n`
   }`;
   return string;
}
seedDB().then(() => {
   console.log('DB seeded, use ^C to close.');
});
