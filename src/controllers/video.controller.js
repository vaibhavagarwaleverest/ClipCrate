import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/videos.model.js"
import {Users} from "../models/users.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {CloudinaryUpload} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    try{


    if(!isValidObjectId(userId))
    {
        throw new ApiError(400, "Invalid User Id")
    }

    const user=await Users.findById(userId)
    if(!user)
    {
        throw new ApiError(400, "User Not Found")
    }
    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    let pipeline=[];

    if(userId)
    {
        pipeline.push({
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        })
    }
    if(query)
    {
        pipeline.push({
            $match:{
                $or:
                    [
                    {title:{$regex:query}},
                    {
                    description:{$regex:query}}
                    ]
                
            }
        })
    }
    let sortValue;
    if(sortBy && sortType)
    {
        if(sortType==="DESC")
        {
            sortValue=-1
        }
        else
        {
            sortValue=1
        }
        pipeline.push({
            $sort:{
                sortBy:sortValue
            }
        })
    }
    pipeline.push(
        {
            $lookup:
            {
                from:"Users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            email:1,
                            avatar:1
                        }
                    }
                ]
            }
        }

    )
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
    pipeline.push({
        $addFields:{
            owner:{
                $arrayElemAt:["$owner",0]
            }
        }
    })

    const aggregate=await Video.aggregate(pipeline)
    
    if(!aggregate)
    {
        throw new ApiError(400,"No Videos Found")
    }
    return res.status(200).json(new ApiResponse(200,aggregate,"Videos Fetched Successfully"))

    


    

    


}
catch(e)
{
    console.log(e.message)
    throw new ApiError(400,e,"Someting went wrong")
}


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    try{
        if(title.trim().length==0 || description.trim().length==0)
        {
            throw new ApiError(400,"Title and decription both required")
        }
        const user=await Users.findOne(req.user?._id)
        if(!user)
        {
            throw new ApiError(400,"User Not Found")
        }

        const uploadVideoPath= req.files?.uploadVideo[0].path;
        const uploadThumbnailpath=req.files?.uploadThumbnail[0].path;
        if(!uploadVideoPath)
        {
            throw new ApiError(400,"Video File should not be empty")
        }
        if(!uploadThumbnailpath)
        {
            throw new ApiError(400,"Thumbnail File should not be empty")
        }
        const videoLink= await CloudinaryUpload(uploadVideoPath);
        const thumbnailLink= await CloudinaryUpload(uploadThumbnailpath);

        if(!videoLink)
        {
            throw new ApiError(400,"thumbnail File has not uploaded to cloudianry server")
        }
        if(!thumbnailLink)
        {
            throw new ApiError(400,"Thumbnail File has not uploaded to cloudianry server")
        }
        console.log(videoLink.url)
        console.log(thumbnailLink.url)
        const video= await Video.create({
            videoFile:videoLink.url,
            thumbnail:thumbnailLink.url,
            title:title,
            description:description,
            duration:videoLink.duration,
            owner:req.user?._id

        })
        await video.save()
        if(!video)
        {
            throw new ApiError(400,"Video not created")
        }
        return res.status(200).json(new ApiResponse(200,video,"Video Published Successfully"));

    }
    catch(e)
    {
        console.log(e.message);
        throw new ApiError(400,"Video not published")
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    console.log(videoId)
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id")

    }

    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not Found")
    }
    const videoURL=video.videoFile
    if(!videoURL)
    {
        throw new ApiError(404,"Video URL not found")
    }
    res.
    status(200).json(new ApiResponse(200, videoURL, "Video Fetched Sucessfully"))
    





})

const updateVideo = asyncHandler(async (req, res) => {
    try{
    const { videoId } = req.params    
    const { title, description} = req.body

    if(!title || !description)
    {
        throw new ApiError(400,"Title and description both required")
    }
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid video id")
    }
    const videoOwner= await Video.findById(videoId)
    if(!videoOwner)
    {
        throw new ApiError(400,"Video Not Found")
    }
    if(toString(videoOwner.owner)!==toString(req.user._id))
    {
        console.log(videoOwner.owner)
        console.log(req.user._id)
        throw new ApiError(401,"Unauthorized request")
    }
    const video= await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title:title,
                description:description
            },
        
        },{$new:true})
    if(!video)
    {
        throw new ApiError(400,"Something went wrong on updating the details")
    }
    return res.status(200).json(new ApiResponse(200,video,"Userdata Updated Successfully"))

    //TODO: update video details like title, description, thumbnail
    }
    catch(error)
    {
        console.log(error)
        throw error
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not Found")
    }
    const videoUrl=video.videoFile
    if(!videoUrl)
    {
        throw new ApiError(404,"Video URL not found")
    }
    // Video Should also be deleted from cloudinary

    const deleteVideo= await Video.findByIdAndDelete(videoId)
    if(!deleteVideo)
    {
        throw new ApiError(400,"Something went wrong on deleting the video")
    }
    return res.status(200).json(new ApiResponse(200,"Video deleted successfully"))


    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    try{
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not Found")
    }
    if(toString(video.owner)!=toString(req.user._id))
    {
        throw new ApiError(401,"Unauthorized request")
    }
    const isPublishedVideo=!video.isPublished;
    const publishedStatusChangeVideo=await Video.findByIdAndUpdate(videoId,
        {
            $set:
        {
            isPublished:isPublishedVideo
        }
    },{
        new:true
    }
        )
    
    return res.status(200).json(new ApiResponse(200,publishedStatusChangeVideo,"Video Published Status Updated Successfully"))
}
catch(error)
{
    console.log(error.message)
    throw new ApiError(400,error.message)
}
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}