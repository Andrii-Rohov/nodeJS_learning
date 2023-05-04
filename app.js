const express = require('express');
const path = require("path");
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitaze = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser")

const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require("./routes/viewRouter");

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

//View implementation
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// This middleware is used to put body from request into req.body
app.use(express.json({
    limit: "10kb"
}));

//Used to parse form data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

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
    console.log(req.cookies)
    next();
})

//Routes

// app.get('/api/v1/tours', gettAllTours);
// app.get('/api/v1/tours/:id/:nextParamOptional?', getTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/', viewRouter);
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