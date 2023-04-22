const express = require('express');
const authController = require(`${__dirname}/../controllers/authController`);
const reviewController = require(`${__dirname}/../controllers/reviewController`);


const route = express.Router({ mergeParams: true });

//Protects all routes after this middleware
route.use(authController.protect);

route.route("/")
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo("user"), reviewController.setTourAndUserIds, reviewController.createReview);

route.route("/:id")
    .get(reviewController.getReview)
    .patch(authController.protect, authController.restrictTo("user", "admin"), reviewController.updateReview)
    .delete(authController.protect, authController.restrictTo("user", "admin"), reviewController.deleteReview);

route.route("/my-reviews")
    .get(authController.protect, reviewController.getAllMyReviews);

module.exports = route;