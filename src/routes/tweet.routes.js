import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    replyToTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use(verifyJWT, upload.none());

router.post("/", createTweet);
router.get("/user/:userId", getUserTweets);
router.patch("/:tweetId", updateTweet);
router.delete("/:tweetId", deleteTweet);
router.post("/reply/:tweetId", replyToTweet);

export default router;