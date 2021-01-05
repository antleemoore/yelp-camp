const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const { postReview, deleteReview } = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, postReview);
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, deleteReview);

module.exports = router;
