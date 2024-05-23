import { isValidObjectId } from "mongoose"
import mongoose from "mongoose"
import { Users } from "../models/users.model.js"
import Comment from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/videos.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    try
    {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Video ID not found")
    }
    const video = await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video not found")
    }
    const parsedLimit=parseInt(limit)
    const pageSkip= (page-1)* parsedLimit
    let pipeline=[];
    pipeline.push({
        $match:{
            video:new mongoose.Types.ObjectId(videoId)
        }
    })
    pipeline.push(
        {$lookup:{
            from:"Videos",
            localField:"video",
            foreignField:"_id",
            as:"video",
            pipeline:[
                {
                    $project:
                    {
                        title:1,
                        description:1
                    }
                }
            ]
            
        }
    }
    )
    pipeline.push({
        $lookup:{
        from:"Users",
        localField:"user",
        foreignField:"_id",
        as:"user",
        pipeline:[
            {
                $project:
                {
                    username:1,
                    email:1,
                    fullName:1,
                }
            }
        ]
        }
    }
    )
    // pipeline.push({
    //     $addFields:{
    //         user:{
    //         $first:"$user"
    //     }}
    // })
    pipeline.push(
        {
            $skip: pageSkip
        }
    )
    ,
    pipeline.push(
    {
        $limit: parsedLimit
    }
    )

    const result=await Comment.aggregate(pipeline);
    if(!result)
    {
        throw new ApiError(400,"Comments not found")
    }
    return res.status(200).json(new ApiResponse(200,result,"Comments Fetched Successfully"))
  
    




}
catch(error)
{
    console.log(error);
    throw new ApiError(401, "Something went wrong");
}
})


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}= req.params
    const {comment}= req.body
    if(!(isValidObjectId(videoId)))
    {
        throw new ApiError(400,"Video ID not found")
        
    }
    const user = await Users.findById(req.user?._id)
    if(!user)
    {
        throw new ApiError(400,"only authorised User can make a comment")
    }
    if (comment.trim().length===0)
    {
        throw new ApiError(400,"Comment should not be empty")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    const com=await Comment.create({
        video:videoId,
        owner:req.user._id,
        content:comment

    })
    com.save()
    if(!com)
    {
        throw new ApiError(400,"Comment not created")
    }
    return res.status(200).json(new ApiResponse(200,com,"Comment Added Successfully"))



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {updatecomment} = req.body
   
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Comment ID not found")
    }
    if(updatecomment.trim().length===0)
    {
        throw new ApiError(400,"Comment should not be empty")
    }
   
    const comment = await Comment.findById(commentId)
    if(!comment)
    {
        throw new ApiError(400,"Comment not found")
    }
    if(comment.owner.toString()!==req.user?._id.toString())
    {
        throw new ApiError(400,"You are not authorized to update this comment")
    }
    const updatedComment= await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:updatecomment,
            owner:req.user?._id
        }
    },{
        $new:true
    })
    if(!updatedComment)
    {
        throw new ApiError(400,"Comment not updated")
    }

    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment Updated Successfully"))
})



const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    console.log(commentId);
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Comment ID not found")
    }
    const comment = await Comment.findById(commentId)
    console.log(comment)
    if(!comment)
    {
        throw new ApiError(400,"Comment not found")
    }
    if(!(toString(comment.owner)===toString(req.user?._id)))
    {
        throw new ApiError(400,"You are not authorized to delete this comment")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if(!deletedComment)
    {
        throw new ApiError(400,"Comment not deleted successully")
    }
    return res.status(200).json(new ApiResponse(200,deleteComment,"Comment deleted successfully"))


})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}