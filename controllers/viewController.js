const Tour = require("./../models/tourModel");
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appCustomError = require('./../utils/appCustomError');

exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find()
    res.status(200).render("overview", {
        title: "All tours",
        tours: tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.find(req.params).populate({
        path: 'reviews',
        fields: "user review rating"
    });

    if(!tour.length) {
        return next(new appCustomError('There is no tour with that name', 404))
    }

    res.status(200).render("tour", {
        title: tour[0].name,
        tour: tour[0]
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render("login", {
        title: "Log into your account"
    });
});

exports.getAccountPage = catchAsync(async (req, res, next) => {
    res.status(200).render('account', {
        title: "Youre account"
    });
})

exports.updateUser = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    });

    req.status(200).render('account', {
        title: "Youre account",
        user: updatedUser
    });
})