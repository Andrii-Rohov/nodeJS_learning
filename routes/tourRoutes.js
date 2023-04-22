const express = require('express');
const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`${__dirname}/../controllers/authController`);
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

// route.param('id', tourController.checkID);

// route.use(authController.protect);

router.use('/:tourId/reviews', reviewRouter);

router.route("/distances/:latlng/unit/:unit")
    .get(tourController.getDistances);

//Could be like this tours-within?distance=20$cneter=40,-20&unit=km
router.route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourController.getToursWithin);

router.route('/top-5-tours')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats')
    .get(tourController.getTourStats);

router.route('/tour-monthly-plan/:year')
    .get(authController.protect, authController.restrictTo("admin", "lead-guide", "guide"),tourController.getMonthlyPlan);

router.route('/importTours')
    .post(tourController.importTours);

router.route('/:id/:optionalParam?')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo("admin", "lead-guide"),tourController.updateTour)
    .delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);

router.route('/')
        .get(tourController.getAllTours)
        .post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.addNewTour);

module.exports = router;