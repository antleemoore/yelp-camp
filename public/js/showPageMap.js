mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
   center: campground.geometry.coordinates, // starting position [lng, lat]
   zoom: 9, // starting zoom
});

new mapboxgl.Marker()
   .setLngLat(campground.geometry.coordinates)
   .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
         `<h4 id="campMapTitle">${campground.title}</h4><p>${campground.location}</p>`
      )
   )
   .addTo(map);
