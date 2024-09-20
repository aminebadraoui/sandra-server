const express = require('express');
const router = express.Router();
const passport = require('passport');

const { signin } = require('./signin');
const { signup } = require('./signup');
const { signout } = require('./signout');
const { me } = require('./me');
const { updateRole } = require('./update-role');
const { makeAdmin } = require('./makeAdmin');

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/signout', signout);
router.get('/me', passport.authenticate('jwt', { session: false }), me);
router.put('/update-role', passport.authenticate('jwt', { session: false }), updateRole);
router.post('/make-admin', passport.authenticate('jwt', { session: false }), makeAdmin);

module.exports = router;