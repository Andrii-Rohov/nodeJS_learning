const mongoose = require('mongoose');
const validator = require("validator");

var bcrypt = require('bcryptjs');

const userShcema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
        trim: true
    },
    photo: {
        type: String
    },
    email: {
        type: String,
        required: [true, "A user must have a email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide valid email"]
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: [8, "A password must be at least 8 char long"],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: [8, "A password must be at least 8 char long"],
        validate: {
            validator: function (el) {
                return this.password === el;
            },
            message: "Passwords are not the same"
        }
    },
    passwordsChangedAt: {
        type: Date
    },
});

userShcema.pre('save', async function(next) {
    // Only run this is passsword modified
    if (!this.isModified("password")) return next();

    //encrypt password(hash) with processor 12% or smth
    this.password =  await bcrypt.hash(this.password, 12);
    //delete passwordConfirm
    this.passwordConfirm = undefined;

    next();
});

userShcema.methods.correctPassword = async (candidatePassword, encryptedPassword) => {
    return await bcrypt.compare(candidatePassword, encryptedPassword);
};

userShcema.methods.changedPasswordAfter = function (timeStampJWT) {
    if (this.passwordsChangedAt) {
        const changedTimestamp = parseInt(this.passwordsChangedAt.getTime() / 1000, 10);
        return timeStampJWT < changedTimestamp;
    }

    return false;
};

const User = new mongoose.model("User", userShcema);

module.exports = User;