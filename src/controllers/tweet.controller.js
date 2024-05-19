import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {Users} from "../models/users.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(content.trim().length===0)
    {
        throw new ApiError(400,"Content is required")
    }
    const user=await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"User not found")
    }
    const tweet= await Tweet.create(
        {
            owner:req.user?._id,
            content:content
        }
    )
    tweet.save()
    if(!tweet)
    {
        throw new ApiError(500,"Something went wrong while creating tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Created Successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if (!isValidObjectId(userId))
    {
    throw new ApiError(400, "invalid user id")
    }
    const user= Users.findById(userId)
    if(!user)
    {
        throw new ApiError(400,"User not found")
    }
    let pipeline=[]
    pipeline.push(
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    )
    pipeline.push({
        $lookup:{
            from:"Users",
            localField:"owner",
            foreignField:"_id",
            as:"owner1",
            pipeline:[
                {
                    $project:{
                        username:1,
                        fullName:1,
                        email:1
                    }
                }
            ]
        }
    })
    const tweet= await Tweet.aggregate(pipeline)
    if(!tweet)
    {
        throw new ApiError(500,"Something went wrong while fetching tweets")
    }
    console.log("vaibahv")
    return res.status(200).json(new ApiResponse(200,tweet,"Tweets Fetched Successfully"))




})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {updateTweet}=req.body

    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid tweet id")
    }
    const tweet= await Tweet.findById(tweetId)
    if(!tweet)
    {
        throw new ApiError(400,"Invalid tweet")
    }
    if(!(toString(tweet.owner)===toString(req.user?._id)))
    {
        throw new ApiError(400,"User Cannot change the Comment")
    }

    const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content:updateTweet
            }
        },
        {
            $new:true
        })
    console.log(updatedTweet)
    if(!updatedTweet)
    {
        throw new ApiError(500,"Something went wrong while updating tweet")
    }
    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}= req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid tweet id")
    }
    const tweet= await Tweet.findById(tweetId)
    if(!tweet)
    {
        throw new ApiError(400,"tweet not found")
    }
    const deletedTweet= await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet)
    {
        throw new ApiError(500,"Something went wrong while deleting tweet")
    }
    return res.status(200).json(new ApiResponse(200,deleteTweet,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}