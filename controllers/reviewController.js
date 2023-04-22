const Review = require("./../models/reviewModel");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const factoryController = require("./factoryController");

const AppCustomError = require("./../utils/appCustomError");


exports.getAllMyReviews = catchAsync(async (req, res) => {
    const allMyReviews = await Review.find({user: req.user.id})

    res.status(200).json({
        status: "success",
        data: allMyReviews
    });
});

exports.setTourAndUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.getAllReviews = factoryController.getAll(Review);

exports.getReview = factoryController.getOne(Review);

exports.createReview = factoryController.createOne(Review);

exports.updateReview = factoryController.updateOne(Review);

exports.deleteReview = factoryController.deleteOne(Review);
