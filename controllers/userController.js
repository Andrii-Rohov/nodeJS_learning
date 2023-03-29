const httpStatusCodes = require("http-status-code-json-list");

exports.gettAllUsers = (req, res) => {
    res.status(+httpStatusCodes[500].code).json({
        status: httpStatusCodes[500].phrase,
        message: "This rout is not yet defined"
    })
}

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