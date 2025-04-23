import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { upload } from '../middlewares/multer.js';
import { publishVideo, updateVideo ,deleteVideo , getAllVideos , getVideoById} from '../controllers/video.controller.js';


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/")
.get(getAllVideos)
.post(
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

router.route("/update/:videoId").patch(
    upload.single("thumbnail"),
    updateVideo
)

router.route("/delete/:videoId").post(deleteVideo)
router.route("/get/:videoId").get(getVideoById)

export default router