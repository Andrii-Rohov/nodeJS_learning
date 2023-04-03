const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: "succes",
        data: {
            user: newUser
        }
    });
});