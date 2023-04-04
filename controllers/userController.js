const httpStatusCodes = require("http-status-code-json-list");
const User = require("./../models/userModel");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

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