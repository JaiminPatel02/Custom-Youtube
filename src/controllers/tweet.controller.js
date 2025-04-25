import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/users.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponce.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) throw new ApiError(400, "content is required");

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) throw new ApiError(500, "failed to create tweet please try again");

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) throw new ApiError(400, "content is required");
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can edit their tweet");
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete their tweet");
    }

    await tweet.deleteOne();

    return res.status(200).json(new ApiResponse(200, { tweetId }, "Tweet deleted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                $or: [
                    { parent: null },
                    { parent: { $exists: false } }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "tweets",
                let: { parentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$parent", "$$parentId"] }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "tweet",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                            likesCount: { $size: "$likes" },
                            isLiked: {
                                $cond: {
                                    if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            createdAt: 1,
                            likesCount: 1,
                            isLiked: 1,
                            parent: 1,
                            owner: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                avatar: 1
                            }
                        }
                    },
                    { $sort: { createdAt: 1 } }
                ],
                as: "replies"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                isLiked: 1,
                replies: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets with replies fetched successfully"));
});


const replyToTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");
    if (!content) throw new ApiError(400, "Content is required");

    // Find the parent tweet (this ensures that a reply can be made to an existing tweet)
    const parentTweet = await Tweet.findById(tweetId);
    if (!parentTweet) throw new ApiError(404, "Tweet not found to reply");

    // Create the reply tweet
    const reply = await Tweet.create({
        content,
        owner: req.user?._id,
        parent: parentTweet._id,
    });

    // Enrich the reply with user details and like info
    const enrichedReply = await Tweet.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(reply._id) },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    { $project: { username: 1, fullName: 1, "avatar.url": 1 } },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    { $project: { likedBy: 1 } },
                ],
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likeDetails" },
                isLiked: {
                    $in: [req.user?._id, "$likeDetails.likedBy"],
                },
                ownerDetails: { $first: "$ownerDetails" },
            },
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                isLiked: 1,
                ownerDetails: 1,
                parent: 1,
            },
        },
    ]);

    return res.status(201).json(
        new ApiResponse(201, enrichedReply?.[0], "Reply added successfully")
    );
});

export { createTweet, updateTweet, deleteTweet, getUserTweets, replyToTweet };
