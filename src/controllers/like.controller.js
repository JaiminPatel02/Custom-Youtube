import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    const likedAlready = await Like.findOne({
        video : videoId,
        likedBy : req.user?._id
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)
        
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        video : videoId,
        likedBy : req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200 , {isLiked : true }));
})

//toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid CommentId");
    }
    const likedAlready = await Like.findOne({
        comment : commentId,
        likedBy : req.user?._id
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)
        
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        comment : commentId,
        likedBy : req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200 , {isLiked : true }));

})

// toggle like on tweet

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid CommentId");
    }
    const likedAlready = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user?._id
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)
        
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        tweet : tweetId,
        likedBy : req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200 , {isLiked : true }));

})
const getVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const likeCount = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $group: {
                _id: "$video",
                totalLikes: { $sum: 1 }
            }
        }
    ]);

    const totalLikes = likeCount[0]?.totalLikes || 0;

    return res.status(200).json(
        new ApiResponse(200, { videoId, totalLikes }, "Like count fetched")
    );
});


//get singlevideo count 



//TODO: get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline:[
                   { $lookup : {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as:"ownerDetails"
                    }
                },
                    {
                        $unwind: "$ownerDetails",
                    },

                ]
            }
        },
        {
              $unwind: "$likedVideo",  
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        },
    ]);
    return res 
    .status(200)
    .json( new ApiResponse(
        200,
        likedVideosAggegate,
        "liked videos fetched successfully"
    ));

    
    


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getVideoLikes,
  
}