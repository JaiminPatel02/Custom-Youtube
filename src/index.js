import dotenv from "dotenv";
import express from "express"; 
import connectDB from "./db/index.js";

// Load environment variables from .env file
dotenv.config({
    path: './.env'
});

const app = express();

// Connect to the database and start the server
connectDB()
    .then(() => {
        // Start the Express server only after successful DB connection
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        // Log error and handle the failure of MongoDB connection
        console.log("MongoDB connection failed:", error);
        process.exit(1); // Exit the process with failure code if DB connection fails
    });
