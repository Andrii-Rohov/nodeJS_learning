const AppCustomError = require(`${__dirname}/../utils/appCustomError`);
const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            stack: err.stack,
            message: err.message
        })
    } else {
        err.statusCode = err.statusCode || 500;
        res.status(err.statusCode).render('error', {
            title: "Something went wrong",
            msg: err.message
        })
    }
};

const sendErrorProd = (err, req, res) => {
    //Operational error: trusted error
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            err.statusCode = err.statusCode || 500;
            err.status = err.status || 'error';
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }

        //First log error
        console.err("Some error occured", err);

        //Send some generic error to client
        return res.status(500).json({
            status: "error",
            message: "Something vent wrong"
        })
    }
    if (err.isOperational) {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        return res.status(err.statusCode).render('error', {
            title: "Something went wrong",
            msg: err.message
        })
    }

    //First log error
    console.err("Some error occured", err);

    //Send some generic error to client
    err.statusCode = err.statusCode || 500;
    return res.status(err.statusCode).render('error', {
        title: "Something went wrong",
        msg: "Please try again later"
    })

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
const handleJWTError = (err) => {
    return new AppCustomError('Invalid token. Please log in again', 401);
}

const handleJWTTokenExpiredError = (err) => {
    return new AppCustomError('Your token expired. Please log in again', 401);
}

module.exports = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = {...err};
        if(err.name === "CastError") error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDUplicateValuesErrorDB(error);
        if(err.name === "ValidationError") error = handleValidationErrorDB(error);
        if(err.name === "JsonWebTokenError") error = handleJWTError(error);
        if(err.name === "TokenExpiredError") error = handleJWTTokenExpiredError(error);

        sendErrorProd(error, req, res);
    }
};