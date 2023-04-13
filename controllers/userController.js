const httpStatusCodes = require("http-status-code-json-list");
const User = require("./../models/userModel");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

const AppCustomError = require("./../utils/appCustomError");

const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {};
    Object.keys(obj).forEach(elem => {
        if (allowedFields.includes(elem)) {
            filteredObj[elem] = obj[elem];
        }
    })
    return filteredObj;
}

exports.gettAllUsers = catchAsync(async (req, res) => {
    const allUsers = await User.find();

    res.status(+httpStatusCodes[200].code).json({
        status: 'succes',
        data: {
            users: allUsers
        }
    });
});

exports.addNewUsers = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
}

exports.getUser = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
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

exports.updateUser = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
}
exports.deleteUser = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
}