module.exports = catchAsync = (func) => {
    return (req, res, nex) => {
        func(req, res, nex).catch(err => next(err));
    }
};