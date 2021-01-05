const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
   renderRegisterForm,
   register,
   renderLoginForm,
   login,
   logout,
} = require('../controllers/users');
const authConfig = { failureFlash: true, failureRedirect: '/login' };

router.route('/register').get(renderRegisterForm).post(register);
router
   .route('/login')
   .get(renderLoginForm)
   .post(passport.authenticate('local', authConfig), login);
router.get('/logout', logout);

module.exports = router;
