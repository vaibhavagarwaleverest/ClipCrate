import { Subscription } from "../models/subscription.model";
import mongoose,{ isValidObjectId } from "mongoose";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import { Users } from "../models/users.model";
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Channel id is Invalid")
    }
    const channel= await Users.findById(channelId)
    if(!channel)
    {
        throw new ApiError("Channel Does'nt exist")
    }
    const user = await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"User should be authorised")
    }
    const isChannelSubscribed= await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })
    if(!isChannelSubscribed)
    {
        const channelSubscribed= await Subscription.create({
            subscriber:req.user._id,
            channel:channelId
        })
    
        if(!channelSubscribed)
        {
            throw new ApiError(400,"Something went wrong while subscribing")
        }
        return res.status(200).json(200,channelSubscribed,"Channel is Successfully subscribed")
    }
    
        const unsubscribed=await Subscription.findByIdAndDelete({
            subscriber:req.user._id,
            channel:channelId
        })
        if(!unsubscribed)
        {
            throw new ApiError(400,"Something went wrong while unsubscribing")
        }
        return res.status(200).json(200,unsubscribed,"Channel is Successfully unsubscribed")
    
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Channel id is Invalid")
    }
    const channel= await Users.findById(channelId)
    if(!channel)
    {
        throw new ApiError("Channel Does'nt exist")
    }

    const user = await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"User should be authorised")
    }
    const pipeline=[];
    pipeline.push({
        $match:{
            channel:channelId
        }
    })
    pipeline.push({
        $lookup:{
            from:"Users",
            localField:"subscriber",
            foreignField:"_id",
            as:"subscribers",
            pipeline:[
                {
                    $project:{
                        username:1,

                    }
                }]
        }
    })
    const aggregate= await Subscription.aggregate(pipeline);
    if(!aggregate)
    {
        throw new ApiError(400,"Something went wrong while fetching detauls")
    }
    return res.status(200).json(200,aggregate,"Subscriber List fetched Successfully")
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId))
    {
        throw new ApiError(400,"subscribedId is not valid")
    }
    const subscriber = await Users.findById(subscriberId)
    if(!subscriber)
    {
        throw new ApiError(400,"subscriber Does'nt exist")
    }
    const user = await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"User should be authorised")
    }
    const pipeline=[];
    pipeline.push({
        $match:{
            subscriber:subscriberId
        }
    })
    pipeline.push({
        $lookup:{
            from:"Users",
            localField:"channel",
            foreignField:"_id",
            as:"channels",
            pipeline:[
                {
                    $project:{
                        username:1,
        }
    }]
}
    })
    
    const aggregate= await Subscription.aggregate(pipeline);
    if(!aggregate)
    {
        throw new ApiError(400,"Something went wrong while fetching detauls")
    }
    return res.status(200).json(200,aggregate,"Subscribed Channel List fetched Successfully")

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}