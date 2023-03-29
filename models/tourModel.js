const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require("validator");

const tourShcema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxlength: [40, "A tour name must have less or equal 40char"],
        minlength: [5, "A tour name must have more or equal 5char"],
        // validate: [validator.isAlpha, "Name must contain only characters"]
    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a maxGroupSize"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ["easy","medium","difficult"],
            message: "Difficulty is easy,medium,difficult"
        }
    },
    summary: {
        type: String,
        required: [true, "A tour must have a summary"],
        trim: true
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, "Rating must be more than 0"],
        max: [5, "Rating must be less than 5"]
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: "Price must be bigger than discount ({VALUE})",
            validator: function(value) {
                return this.price > value;
            }
        }
    },
    description: {
        type: String,
        trim: true
    },
    images: [String],
    imageCover: {
        type: String,
        required: [true, "A tour must have a imageCover"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

//Virtual properties a.k.a. Getters
tourShcema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//Document Middleware: runs before .save() and create()
tourShcema.pre("save", function(next) {
    this.slug = slugify(this.name, { lower: true});
    next();
});

// tourShcema.pre("save", function(next) {
//     console.log("will save document")
//     next();
// });

// tourShcema.post("save", function(doc, next) {
//     console.log(doc)
//     next();
// });

//Query middleware
tourShcema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}});
    this.start = Date.now();
    next();
});

tourShcema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} mls`);
    next();
});

//Aggregation middleware
tourShcema.pre("aggregate", function(next) {
    this.pipeline().unshift({'$match': { secretTour: { $ne: true}}});
    console.log(this.pipeline());
    next();
});

const Tour = new mongoose.model("Tour", tourShcema);

module.exports = Tour;