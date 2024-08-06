import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // for optimizing searching in database
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // url from cloudanary
            required: true,
        },
        coverImage: {
            type: String, // url from cloudanary
        },
        // Watch history is going to be an array of videos. So we will use video modal to store the information of watched videos.
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required."],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);
// Pre is a middleware in mongoose it is a hook in mongoose.
// it works on some events like here we are using this for the "save" event.
// userSchema.pre("save", () => {})
// it is not advisable to write callback using arrow function because arrow function doesn't hvae refrence or in other words we can't use this.
// encryption and other things like this takes some time for encryption as some algorithms runs and then encryption happens so these are written using async functions
userSchema.pre("save", async function (next) {
    // this is modified function is method in mogoose which automatically detects  whether a particular field has been modified or not.
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

// Defining a method to check for password when a user try to login into his account
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email, 
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};
export const User = mongoose.model("User", userSchema);
