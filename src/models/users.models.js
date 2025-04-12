import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the User schema
const userSchema = new Schema(
    {
        // Unique username for the user (lowercased, trimmed, indexed for search)
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        // Unique email address of the user (lowercased, trimmed)
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // <-- Fixed typo from 'lowecase'
            trim: true,
        },
        // Full name of the user (trimmed, indexed for search)
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        // Cloudinary URL or path to avatar image (required)
        avatar: {
            type: String,
            required: true,
        },
        // Optional cover image (also Cloudinary URL or path)
        coverImage: {
            type: String,
        },
        // Array of video IDs representing the user's watch history
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        // User password (will be hashed before saving)
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        // Refresh token for authentication (optional, for session management)
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

// Mongoose middleware: hashes password before saving if it's modified
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if password is changed
    this.password = await bcrypt.hash(this.password, 10); // Hash password with salt rounds = 10
    next();
});

// Instance method: checks if entered password matches hashed password in DB
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Instance method: generates an access token (JWT)
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key from .env
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Expiry duration from .env
        }
    );
};

// Instance method: generates a refresh token (JWT)
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


export const User = mongoose.model("User", userSchema);