const AppCustomError = require(`${__dirname}/../utils/appCustomError`);
const sendErrorDev = (err, res) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        stack: err.stack,
        message: err.message
    })
};

const sendErrorProd = (err, res) => {
    //Operational error: trusted error
    if (err.isOperational) {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        //First log error
        console.err("Some error occured", err);

        //Send some generic error to client
        res.status(500).json({
            status: "error",
            message: "Something vent wrong"
        })
    }
};

const handleDUplicateValuesErrorDB = (err) => {
    let value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    let errorMassage = `Duplacate field value ${value}. Please use another value`
    return new AppCustomError(errorMassage, 400);
};

const handleCastErrorDB = (err) => {
    let errorMassage = `Invalid ${err.path}: ${err.value}`
    return new AppCustomError(errorMassage, 400);
};

const handleValidationErrorDB = (err) => {
    let errorArray = Array.from(err.errors);
    let value = errorArray.map(elem => {
        return elem.message;
    }).join('. ');
    let errorMassage = `Invalid input data: ${value}`
    return new AppCustomError(errorMassage, 400);
};

module.exports = (err, re, res, next) => {
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = {...err};
        if(err.name === "CastError") error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDUplicateValuesErrorDB(error);
        if(err.name === "ValidationError") error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
};