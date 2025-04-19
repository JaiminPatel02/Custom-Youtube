// import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
// import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



   // get video, upload to cloudinary, create video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
   
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnailFile[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400 , "Video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400 , "thumbnail file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)
    
    if (!videoFile) {
        throw new ApiError(400 , "Video file is required")
    }
    if (!thumbnailFile) {
        throw new ApiError(400 , "thumbnail file is required")
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url ,
        thumbnailFile:thumbnailFile.url,
        owner: req.user?._id,
        isPublished: false
    })

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }
    return res
    .status(200)
    .json( new ApiResponse(200, video, "Video uploaded successfully"));
    

})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination


})



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}