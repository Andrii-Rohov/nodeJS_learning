const mongoose = require('mongoose');
const Tour = require("./tourModel");

const reviewShcema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review can not be empty"]
    },

    rating: {
        type: Number,
        min: [1, "Rating must be more than 1"],
        max: [5, "Rating must be less than 5"]
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour"]
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

//Indexes(a.k.a. sorting in DB)
//This makes only one review for user
reviewShcema.index({tour: 1, user: 1}, { unique: true });

//Query middleware
reviewShcema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo' //to exclude some data that we don`t want to recieve
    });//.populate({
    //     path: 'tour',
    //     select: 'name' //to exclude some data that we don`t want to recieve
    // });

    next();
});

reviewShcema.post("save", function () {
    this.constructor.calcAverageRating(this.tour);

});

reviewShcema.pre(/^findOneAnd/, async function (next) {
    this.doc = await this.findOne();

    next();
});

reviewShcema.post(/^findOneAnd/, async function () {

    await this.doc.constructor.calcAverageRating(this.doc.tour);

});

reviewShcema.statics.calcAverageRating = async function(tourId) {
    let stats = await this.aggregate([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: "$rating"}
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

const Review = new mongoose.model("Review", reviewShcema);

module.exports = Review;