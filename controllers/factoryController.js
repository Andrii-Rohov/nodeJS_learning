const AppCustomError = require("./../utils/appCustomError");
const catchAsync = require("./../utils/catchAsync");
const ApiFeatures = require(`${__dirname}/../utils/apiFeatures.js`);

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    let document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
        return next(new AppCustomError(`No document find with id :${req.params.id}`, 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    let document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!document) {
        return next(new AppCustomError(`No document find with id :${req.params.id}`, 404));
    }

    res.status(200).json({
        status: "success",
        data: document
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    let newDocument = await Model.create(req.body);

    res.status(201).json({
        status: "success",
        data: newDocument
    });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    let document = await query;

    if (!document) {
        return next(new AppCustomError(`No document find with id :${req.params.id}`, 404));
    }

    res.status(200).json({
        status: "success",
        result: 1,
        data: {
            document: document
        }
    });
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    // To allow for neste GET reviews on tour (hack)
    let filterObj = {};
    if (req.params.tourId) {
        filterObj = { tour: req.params.tourId };
    }

    let doc = new ApiFeatures(Model.find(filterObj), req.query)
        .filter()
        .sorting()
        .limiting()
        .pagination();
    let document = await doc.query;
    res.status(200)
    .json({
        status: "success",
        requestTime: req.requestTime,
        result: document.length,
        data: {
            document
        }
    });

});