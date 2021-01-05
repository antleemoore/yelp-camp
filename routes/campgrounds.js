const express = require('express');
const router = express.Router();
const {
   index,
   renderNewForm,
   newCampground,
   showCampground,
   renderEditForm,
   editCampground,
   deleteCampground,
} = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/').get(index).post(isLoggedIn, validateCampground, newCampground);
router.get('/new', isLoggedIn, renderNewForm);
router
   .route('/:id')
   .put(isLoggedIn, isAuthor, validateCampground, editCampground)
   .delete(isLoggedIn, isAuthor, deleteCampground)
   .get(showCampground);
router.get('/:id/edit', isLoggedIn, isAuthor, renderEditForm);

module.exports = router;
