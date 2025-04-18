import { Router } from "express";
import { registerUser, loginUser ,logoutUser ,refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 2
        }
    ]),
    registerUser);

router.route("/login").post(loginUser) 
router.route("/login/:username/:password").get(loginUser);


//secure routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/logout").get(verifyJWT, logoutUser)  
router.route("/refresh-token").get(refreshAccessToken).post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").post(verifyJWT, upload.single("avatar") ,updateUserAvatar)
router.route("/coverimage").post(verifyJWT, upload.single("coverImage") ,updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default router;