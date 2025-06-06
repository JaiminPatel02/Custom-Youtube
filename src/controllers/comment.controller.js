import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parent: null // Only top-level comments
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
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments", // Lookup replies
                let: { parentId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$parent", "$$parentId"] } } },
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
                            foreignField: "comment",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                            likesCount: { $size: "$likes" },
                            isLiked: {
                                $cond: {
                                    if: {
                                        $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                                    },
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
                likesCount: { $size: "$likes" },
                owner: { $first: "$owner" },
                isLiked: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } },
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

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    return res.status(200).json(new ApiResponse(200, comments, "Comments with replies fetched successfully"));
});

//Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found") 
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if (!comment) {
        throw new ApiError(500, "Failed to add comment please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content
            }
        },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }
    return res
    .status(200)
    .json(new ApiResponse (200, updatedComment ,"Comment updated Succesfully")) 

});

// delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate("video");

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const isCommentOwner = comment.owner.toString() === req.user._id.toString();
    const isVideoOwner = comment.video?.owner.toString() === req.user._id.toString();

    if (!isCommentOwner && !isVideoOwner) {
        throw new ApiError(403, "Only the comment or video owner can delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});

const replyToComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Reply content is required");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
    }

    const video = await Video.findById(parentComment.video);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const reply = await Comment.create({
        content,
        video: parentComment.video,
        owner: req.user._id,
        parent: commentId
    });

    return res.status(201).json(new ApiResponse(201, reply, "Reply added successfully"));
});




export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    replyToComment
    }