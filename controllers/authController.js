const { promisify } = require('util'); // else could be utils.promisify
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AppCustomError = require(`${__dirname}/../utils/appCustomError`);
const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
}

const createAndSendToken = (user, statusCode, res) => {
    console.log(user)
    let token = signToken(user._id);

    res.status(statusCode).json({
        status: "succes",
        token,
        data: {
            user: user
        }
    });
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role //This is bad practice, but it`s in the course
    });

    createAndSendToken(newUser, 201, res);
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
    createAndSendToken(user, 200, res);
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
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new AppCustomError("You do not have permission to perform this action", 403))
        }

        next()
    }
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on POSTed email
    let email = req.body.email;
    const user = await User.findOne({email});
    if (!user) {
        return next(new AppCustomError("There is no user with that email", 404));
    }

    //2)Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    //3) Send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot youre password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
    If you didnt forget youre password, please ignore this email`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Youre password reset token (valid for 10 min)",
            message
        });
    } catch(err) {
        user.createPasswordResetToken = undefined;
        user.createPasswordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppCustomError("There was an error sending the email. Try again later", 500));
    }

    res.status(200).json({
        status: "success",
        message: "Token sent to email"
    });
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
    console.log(user);

    //2) If token not expired and user exists, set new password
    if(!user) {
        return next(new AppCustomError("There is no user, or youre token has expired. Try again later", 400));
    }

    //3) Update changed password for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //4)Log the user in, send JWT
    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get the user from collection
    const user = await User.findById(req.user.id).select("+password");

    //2) Check if POSTed password is correct
    let correctPassword = user ? await user.correctPassword(req.body.oldPassword, user.password) : null;

    if(!user || !correctPassword) {
        return next(new AppCustomError('Incorrect email or password', 401));
    }
    //3) If correct update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    //4) Log user in, send JWT
    createAndSendToken(user, 200, res);
});