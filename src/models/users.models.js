import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: { 
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
        },
         email: { 
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
          fullName: { 
            type: String,
            require: true,
            trim: true,
            index: true,
        },
        avetar: {
            tupe: String,// Clouderi url 
            require: true, 
        },
        coverImage: {
            tupe: String, 
        },
        whathistory: [
            {
                type: Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password:  {
            type: String,
            require: [true, 'Pasword is required'],
        },
        refreshToken: {
            type: String,
        }  
    },
    {
        timestamps: true
    }
)

const bcrypt = require("bcrypt");

// ❗ Use a regular function, NOT an arrow function in Mongoose middleware,
// because we need access to `this`, which refers to the document being saved
userSchema.pre("save", async function (next) { 
    // If the password field hasn't been modified, skip re-hashing and continue
    if (!this.isModified("password")) return next();

    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);

    // Call next() to proceed to the next middleware or save the document
    next();
});

// 🧪 Custom instance method to check if entered password matches hashed password in DB
userSchema.methods.isPasswordCorrect = async function (password) {
    // `password` is the plain text one entered by the user (e.g., at login)
    // `this.password` is the hashed password stored in the database
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function (generateAccessToken) {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullname,
        username: this.username,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (generateAccessToken) {
     return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User" , userSchema)