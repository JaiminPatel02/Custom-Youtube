import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.models.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
   try {
     const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer", "")
 
     if (!token) {
         throw new ApiError(401 ,"Unauthorized request ")
     }
 
     const decodedInformtion = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     
     const user = await User.findById(decodedInformtion?._id)
         .select("-password -refreshToken")
     
     if (!user) {
         //todo 
         // 
         throw new (401, " Invalid Access Token")
     }
     req.user = user;
     next();
   } catch (error) {
    throw new (401, error?.message || "Invalide  Access Token")
   }
})