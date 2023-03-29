const fs = require('fs');
const mongoose = require('mongoose');
const httpStatusCodes = require("http-status-code-json-list");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const allTours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));
const Tour = require(`${__dirname}/../models/tourModel`);
const ApiFeatures = require(`${__dirname}/../utils/apiFeatures.js`);

exports.aliasTopTours = (req, res, next) => {
    req.query = {
        limit: '5',
        sort: '-ratingsAverage,price',
        fields: 'name,difficulty,price,ratingsAverage,summary'
    };

    next();
};

exports.getTourStats = async (req, res) => {
    try {
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
    } catch(err) {
        console.log(err)
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            data: err
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    let year = req.params.year * 1;
    try {
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
    } catch(err) {
        console.log(err)
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            data: err
        });
    }
};

exports.getAllTours = async (req, res) => {
    try {
        let toursFeature = new ApiFeatures(Tour.find(), req.query)
            .filter()
            .sorting()
            .limiting()
            .pagination();

        let tours = await toursFeature.query;

        res.status(+httpStatusCodes[200].code)
        .json({
            status: httpStatusCodes[200].phrase,
            requestTime: req.requestTime,
            result: tours.length,
            data: {
                tours
            }
        });
    } catch(err) {
        res.status(+httpStatusCodes[404].code).json({
            status: "fail",
            message: err
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        let tour = await Tour.findById(req.params.id);

        res.status(+httpStatusCodes[200].code).json({
            status: httpStatusCodes[200].phrase,
            result: 1,
            data: {
                tour: tour
            }
        });
    } catch(err) {
        res.status(+httpStatusCodes[404].code).json({
            status: "fail",
            message: err
        });
    }

};

exports.addNewTour = async (req, res) => {
    try {
        let newTour = await Tour.create(req.body);

        res.status(+httpStatusCodes[201].code).json({
            status: "success",
            data: newTour
        });
    } catch(err) {
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            data: err
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        let tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(+httpStatusCodes[200].code).json({
            status: httpStatusCodes[200].phrase,
            tour: tour
        })
    } catch(err) {
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            data: err
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(+httpStatusCodes[204].code).json({
            status: 'success',
            data: null
        });
    } catch(err) {
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            data: err
        });
    }
};

///Import all tours from file

exports.importTours = async (req, res) => {
    try {
        let updatedAllTours = allTours.map(elem => {
            delete elem._id;
            return elem;
        });
        await Tour.insertMany(updatedAllTours);

        res.status(+httpStatusCodes[201].code).json({
            status: "success",
            data: "good"
        });

    } catch (err) {
        console.log(err)
        res.status(+httpStatusCodes[400].code).json({
            status: "fail",
            err
        });
    }
}