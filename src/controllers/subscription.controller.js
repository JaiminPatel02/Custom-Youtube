import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/users.models.js";
import { Subscription } from "../models/subscribtion.models.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// toggle subscription 
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }
    const subscribedAlready =await Subscription.findOne({
        subscriber: req.user?._id,
        channel : channelId
    })

    if (!subscribedAlready) {
        await Subscription.findByIdAndDelete(subscribedAlready?._id)


        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "unsunscribed successfully"));
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel : channelId
    });

    return res
    .status(200)
    .json(new ApiResponse(200 , { isSubscribed: true }, "Sunscribed successfully" ));

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                   {
                    $lookup: {   
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "channel",
                        as: "subscribedToSubscriber"
                    }
                },
                 {
                    $addFields:{
                        subscribedToSubscriber:
                        {$cond:{
                            if: {
                                $in:[
                                        channelId,
                                        "$subscribedToSubscriber.subscriber",
                                    ]  
                            },
                            then: true,
                            else: false,
                        }},
                        subscribersCount: {
                            $size: "$subscribedToSubscriber",
                        },
                    },
                 } ,  
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "subscribers fetched successfully"
        )
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.aggregate([
        { $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId),
        },},
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ]);

   
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribedChannels,
            "subscribed channels fetched successfully"
        )
    );

    
})

const getChannelDetails = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const channelDetails = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscribers" }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoIds: "$videos._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$video", "$$videoIds"] }
                        }
                    },
                    {
                        $group: {
                            _id: "$video",
                            likes: { $sum: 1 }
                        }
                    }
                ],
                as: "videoLikes"
            }
        },
        {
            $addFields: {
                videos: {
                    $map: {
                        input: "$videos",
                        as: "video",
                        in: {
                            _id: "$$video._id",
                            title: "$$video.title",
                            description: "$$video.description",
                            thumbnail: "$$video.thumbnail",
                            views: "$$video.views",
                            duration: "$$video.duration",
                            createdAt: "$$video.createdAt",
                            likes: {
                                $let: {
                                    vars: {
                                        matchedLike: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$videoLikes",
                                                        as: "vl",
                                                        cond: { $eq: ["$$vl._id", "$$video._id"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: "$$matchedLike.likes"
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                videos: { $ifNull: ["$videos", []] },
                recentVideo: {
                    $arrayElemAt: [
                        {
                            $slice: [
                                {
                                    $sortArray: {
                                        input: "$videos",
                                        sortBy: { createdAt: -1 }
                                    }
                                },
                                1
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },
        {
            $lookup: {
                from: "playlists",
                localField: "_id",
                foreignField: "owner",
                as: "playlists"
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                totalSubscribers: 1,
                videos: 1,
                recentVideo: 1,
                tweets: 1,
                playlists: 1
            }
        }
    ]);

    if (!channelDetails.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(200, channelDetails[0], "Channel details fetched successfully")
    );
});




export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getChannelDetails
}