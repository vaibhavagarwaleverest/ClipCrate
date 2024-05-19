import ApiError from "../utils/ApiError.js";
import Like from "../models/likes.model.js"
import Comment from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandlers  from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/videos.model.js";
import { Users } from "../models/users.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike= asyncHandlers(async(req,res)=>
{
    try
    {
    const {videoId}=req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id")
    }
    const video=await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not Found")
    }
    const user =await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"only authorised User can Like a comment")
    }
    const alreadyLiked=await Like.findOne({likedBy:req.user._id,video:videoId})
    if(alreadyLiked)
    {
        console.log("already Liked")
        const unlikedVideo=await Like.findOneAndDelete({video:videoId,likedBy:req.user?._id})
        if(!unlikedVideo)
        {
            throw new ApiError(400,"Video is not unliked having some error")
        }
        return res.status(200).json(new ApiResponse(200,unlikedVideo,"Video Unliked Successfully"));

    }


    else{
    
    const likedVideo= await Like.create({
        video:videoId,
        likedBy:req.user._id
    })
    likedVideo.save()
    if(!likedVideo)
    {
        throw new ApiError(400,"Video is not liked having some error")
    }
    return res.status(200).json(new ApiResponse(200,likedVideo,"Video Liked Successfully"));
    }
}
catch(error)
{
    console.log("vaibhav")
    console.log(error.message)
    throw new ApiError(400,error.message)
}
}
)

const toggleCommentLike=asyncHandlers(async(req,res)=>
{
    try{
    const {commentId}=req.params
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Comment ID is Invalid")
    }
    const comment= await Comment.findById(commentId)
    if(!comment)
    {
        throw new ApiError(400,"Comment Not Found")
    }
    const user= await Users.findById(req.user?._id)
    if(!user)
    {
        throw new ApiError(400,"Only authorised user can like a comment")
    }
    let alreadyLikedComment= await Like.findOne({
        likedBy:req.user?._id,
        comment:commentId
    })
    if(alreadyLikedComment)
    {
        const unlikedComment=await Like.findOneAndDelete({
            likedBy:req.user?._id
            ,comment:commentId
        })
        if(!unlikedComment)
        {
            throw new ApiError(400,"Comment is not unliked having some error")
        }
        return res.status(200).json(new ApiResponse(200,unlikedComment,"Comment unliked successfully"))

    }
    let likedComment= await Like.create(
        {
            comment:commentId,
            likedBy:req.user?._id
        }
    )
    likedComment.save()
    if(!likedComment)
    {
        throw new ApiError(400,"Comment is Not Liked Sucessfully")
    }
    return res.status(200).json(new ApiResponse(200,likedComment,"Comment liked Successfully"))
}
catch(error)
{
    console.log(error)
    console.log(error.message)
    throw new ApiError(400,error.message)
}
})
const toggleTweetLike= asyncHandlers(async(req,res)=>
{
    
    const {tweetId}= req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Tweet id is Invalid")
    }
    const tweet=await Tweet.findById(tweetId)

    if(!tweet)
    {
        throw new ApiError(400,"Tweet not found")
    }
    const user = await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"only authorised user can toggle a tweet like")
    }
    const alreadyLikedTweet= await Like.findOne(
        {tweet:tweetId,likedBy:req.user._id}
        )
    if(alreadyLikedTweet)
    {
        const unlikedTweet=await Like.findOneAndDelete(
            {tweet:tweetId,likedBy:req.user?._id}
        )
        if(!unlikedTweet)
        {
            throw new ApiError(400,"Tweet is not unliked having some error")
        }
        return res.status(200).json(new ApiResponse(200,unlikedTweet,"Tweet unliked successfully"))
    }
    const likedTweet= await Like.create(
        {
            tweet:tweetId,
            likedBy:req.user?._id
        })
    if(!likedTweet)
    {
        throw new ApiError(400,"Tweet is not liked having some error")
    }
    return res.status(200).json(new ApiResponse(200,likedTweet,"Tweet Liked Successfully"))
    

})
const getAllVideoLikes=asyncHandlers(async(req,res)=>{

})
    
 export {
     toggleVideoLike,
     toggleCommentLike,
     toggleTweetLike,
     getAllVideoLikes
 }