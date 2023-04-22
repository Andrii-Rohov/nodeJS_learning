const httpStatusCodes = require("http-status-code-json-list");
const User = require("./../models/userModel");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

const AppCustomError = require("./../utils/appCustomError");
const factoryController = require("./factoryController");

const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {};
    Object.keys(obj).forEach(elem => {
        if (allowedFields.includes(elem)) {
            filteredObj[elem] = obj[elem];
        }
    })
    return filteredObj;
}

exports.addNewUsers = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;

    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppCustomError("This route is not for password update!", 400))
    }
    //2) Update User document
    const fillteredBody = filterObj(req.body,"name", "email");
    const updatedUser = await User.findByIdAndUpdate(req.user.id, fillteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "succes",
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false }, {
        new: true,
        runValidators: true
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.gettAllUsers = factoryController.getAll(User);

exports.getUser = factoryController.getOne(User);

exports.updateUser = factoryController.deleteOne(User);

exports.deleteUser = factoryController.deleteOne(User);