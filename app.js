const express = require('express');
const morgan = require('morgan');

const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);

const app = express();

//Middlewares

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// This middleware is used to put body from request into req.body
app.use(express.json());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
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

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: "failed",
        message: `C'ant find ${req.originalUrl} on this server`
    })
});

module.exports = app;