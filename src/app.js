
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Enable CORS to allow requests from a specified origin
// `credentials: true` allows cookies and auth headers to be sent cross-origin
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Parse incoming JSON requests with a size limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded data (e.g., form submissions)
// `extended: true` allows for rich objects and arrays in URL-encoded format
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" directory (e.g., images, CSS, JS files)
app.use(express.static("public"));

// Parse cookies from the incoming requests and make them available via req.cookies
app.use(cookieParser());

// Routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import likeRouter from "./routes/like.routes.js"

// Routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/like", likeRouter)

export { app }; // Export the app to be used in the index.js file
