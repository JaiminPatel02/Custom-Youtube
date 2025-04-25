
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

//routes import

import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
// import healthcheckRouter from "./routes/healthcheck.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/video", videoRouter);
// app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);



export { app }; // Export the app to be used in the index.js file
