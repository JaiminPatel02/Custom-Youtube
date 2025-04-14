import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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

router.route("/refresh-Token").post(refreshAccessToken)

export default router;