const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getUsers } = require('./users');
const {
    getServiceCategories,
    addServiceCategory,
    addServiceTag,
    deleteServiceCategory,
    deleteServiceTag,
    editServiceCategory,
    editServiceTag
} = require('./serviceCategories');

router.get('/users', passport.authenticate('jwt', { session: false }), getUsers);
router.get('/service-categories', passport.authenticate('jwt', { session: false }), getServiceCategories);
router.post('/service-categories', passport.authenticate('jwt', { session: false }), addServiceCategory);
router.post('/service-categories/:categoryId/tags', passport.authenticate('jwt', { session: false }), addServiceTag);
router.delete('/service-categories/:categoryId', passport.authenticate('jwt', { session: false }), deleteServiceCategory);
router.delete('/service-categories/:categoryId/tags/:tagId', passport.authenticate('jwt', { session: false }), deleteServiceTag);
router.put('/service-categories/:categoryId', passport.authenticate('jwt', { session: false }), editServiceCategory);
router.put('/service-categories/:categoryId/tags/:tagId', passport.authenticate('jwt', { session: false }), editServiceTag);

module.exports = router;