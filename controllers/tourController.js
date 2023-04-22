const fs = require('fs');
const mongoose = require('mongoose');
const httpStatusCodes = require("http-status-code-json-list");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const allTours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));
const Tour = require(`${__dirname}/../models/tourModel`);
const ApiFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const AppCustomError = require(`${__dirname}/../utils/appCustomError`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const factoryController = require("./factoryController");

exports.aliasTopTours = (req, res, next) => {
    req.query = {
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,difficulty,price,ratingsAverage,summary'
    };

    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
    let tourStats = await Tour.aggregate([
        {
            $match: { ratingsAverage: {$gte: 4.5}}
        },
        {
            $group: {
                _id: "$difficulty",
                numTours: { $sum: 1 },
                numRaitings: { $sum: "$ratingsAverage" },
                avgRaiting: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                maxPrice: { $max: "$price" },
                minPrice: { $min: "$price" },
            }
        },
        {
            $sort: { numTours: -1}
        },
        // {
        //     $match: {_id: { $ne: "easy"} }
        // }
    ]);
    res.status(+httpStatusCodes[200].code)
    .json({
        status: httpStatusCodes[200].phrase,
        requestTime: req.requestTime,
        result: tours.length,
        data: {
            tourStats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    let year = req.params.year * 1;
    let plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: { startDates: { $gte: new Date( `${year}-01-01` ), $lte: new Date(`${year}-12-31` ) }}
        },
        {
            $group: {
                _id: { $month: "$startDates"},
                countOfTours: { $sum: 1},
                tours: { $push: "$name"}
            }
        },
        {
            $addFields: { month: "$_id"}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { countOfTours: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(+httpStatusCodes[200].code)
    .json({
        status: httpStatusCodes[200].phrase,
        requestTime: req.requestTime,
        data: {
            plan
        }
    });
});

exports.getAllTours = factoryController.getAll(Tour);

exports.getTour = factoryController.getOne(Tour,{ path: "reviews" });

exports.addNewTour = factoryController.createOne(Tour);

exports.updateTour = factoryController.updateOne(Tour);

exports.deleteTour = factoryController.deleteOne(Tour);

//"/tours-within/:distance/center/:latlng/unit/:unit"
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    if(!lat || !lng) {
        next(new AppCustomError("Please provide valid format for lat and lng", 400))
    }

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {$centerSphere: [[lng, lat], radius]}
        }
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
});


exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === "mi" ? 0.000621371 :  0.001;

    if(!lat || !lng) {
        next(new AppCustomError("Please provide valid format for lat and lng", 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        results: distances.length,
        data: {
            data: distances
        }
    })
});

///Import all tours from file
exports.importTours = catchAsync(async (req, res, next) => {
    let updatedAllTours = allTours.map(elem => {
        delete elem._id;
        return elem;
    });
    await Tour.insertMany(updatedAllTours);
    res.status(+httpStatusCodes[201].code).json({
        status: "success",
        data: "good"
    });
})