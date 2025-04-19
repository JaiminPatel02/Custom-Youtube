import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { upload } from '../middlewares/multer.js';
import { publishVideo } from '../controllers/video.controller.js';


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/upload-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnailFile",
            maxCount: 1
        }
    ]), 
    publishVideo)

export default router