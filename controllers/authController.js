const { promisify } = require('util'); // else could be utils.promisify
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const AppCustomError = require(`${__dirname}/../utils/appCustomError`);
const catchAsync = require("./../utils/catchAsync");

const signToken = (id) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    let token = signToken(newUser._id);

    res.status(201).json({
        status: "succes",
        token,
        data: {
            user: newUser
        }
    });
});

exports.logIn = catchAsync(async (req, res, next) => {
    //Get email and password from req.body to be sure both present
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new AppCustomError('Please provide email and password', 400));
    }

    //Find user with that email, and if it dosn't exist throw error
    const user = await User.findOne({email}).select("+password");
    let correctPassword = user ? await user.correctPassword(password, user.password) : null;

    if(!user || !correctPassword) {
        return next(new AppCustomError('Incorrect email or password', 401));
    }

    //Create and send token
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    //Getting token and check if exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    //Validate verification token with jwt module
    if (!token) {
        return next(new AppCustomError('You are not logged in, please log in to get access', 401))
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded)

    //If Verified check if user still exist
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppCustomError("The user belonging to this token does not longer exist", 401))
    }

    //Check if user changed password after jwt token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppCustomError("User recently changed password. Please log", 401));
    }

    req.user = currentUser;
    next();
})