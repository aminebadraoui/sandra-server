const express = require('express');
const router = express.Router();
const getServiceCategories = require('./getServiceCategories');

router.get('/', getServiceCategories);

module.exports = router;