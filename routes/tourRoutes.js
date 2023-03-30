const express = require('express');
const tourController = require(`${__dirname}/../controllers/tourController`);

const route = express.Router();

// route.param('id', tourController.checkID);

route.route('/')
    .get(tourController.getAllTours)
    .post(tourController.addNewTour);

route.route('/top-5-tours')
    .get(tourController.aliasTopTours, tourController.getAllTours)

route.route('/tour-stats')
    .get(tourController.getTourStats);

route.route('/tour-monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

route.route('/importTours')
    .post(tourController.importTours);

route.route('/:id/:optionalParam?')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = route;