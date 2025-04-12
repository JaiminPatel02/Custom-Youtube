import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponce.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frount end 
    //validation - not empty
    // check if user aulready exit : username / email
    // check for files :images  , avatar
    //upload then couldinary
    // create obaject - create entry in db
    // remove password and rfresh token field from responce
    // CHECK for user creation
    // retuen responce
    
    const { username, fullName, email, password } = req.body
    console.log("email : ", email)
    
    // bigners  if (fullName === "") { throw new ApiError(400, "fullname is required") }
    
    if (
        [fullName ,email ,username ,password].some((field)=> { field?.trim() === "" })
    ) {
        throw new ApiError (400, "All Field Require")
    }

   const existedUser =  User.findOne({
        $or: [{username}, {email}]
   })
    if (existedUser) {
        throw new ApiError(409,"User aulready exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.localpath;

    if (!avatarLocalPath) {
        throw new ApiError(400 , "avatar file is require")
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
     if (!avatar) {
        throw new ApiError(400 , "avatar file is not uploaded")  
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        username: username.toLowerCase(),
        email,
        password,
        coverImage: coverImage.url || ""
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Somthig went wrong while creat user")
    }

    return ApiResponse.status(201).json(200, createdUser, "User register Sucessflly ")
    
   
});

export { registerUser };