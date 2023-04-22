const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitaze = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);

const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const AppCustomError = require(`${__dirname}/utils/appCustomError`);

const app = express();

//Global Middlewares

//Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit requests from same IP
const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "To many requests from this IP, please try in an hour!"
});

app.use("/api", limiter);


// This middleware is used to put body from request into req.body
app.use(express.json({
    limit: "10kb"
}));

//Data sanitization against NoSQL query injections
app.use(mongoSanitaze()); //user: {$gt: ""}

//Data sanitization against XSS (Cross SIte Script attack)
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: ["duration", "difficulty", "price", "maxGroupSize", "ratingsAverage", "ratingQuantity"]
}))

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers)
    next();
})

//Routes

// app.get('/api/v1/tours', gettAllTours);
// app.get('/api/v1/tours/:id/:nextParamOptional?', getTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    const err = new AppCustomError(`C'ant find ${req.originalUrl} on this server`, 404);
    next(err);
});

//Global error handle
app.use(globalErrorHandler);

module.exports = app;