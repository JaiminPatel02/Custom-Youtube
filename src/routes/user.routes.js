import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
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
 

//secure routes

router.route("/logout").post(verifyJwt ,loginUser)

export default router;