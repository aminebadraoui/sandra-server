const express = require('express');
const router = express.Router();

const { signin } = require('./signin');
const { signup } = require('./signup');
const { signout } = require('./signout');

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/signout', signout);

module.exports = router;