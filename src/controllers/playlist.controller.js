import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Users } from "../models/users.model.js"
import { Video } from "../models/videos.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(name.trim().length===0 || description.trim().length===0)
    {
        throw new ApiError(400,"Name and description both required")
    }
    const user=await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"Only Authorised User Can create a playlist")
    }
    const playlist= await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id,
        
    })
    if(!playlist)
    {
        throw new ApiError(400,"Something went wrong while creating a playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist created Successfully"))


    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"Invalid User Id");
    }
    const user= await Users.findById(userId)
    if(!user)
    {
        throw new ApiError(400,"User Not Found")
    }
    const logged_in_user=await Users.findById(req.user._id)
    if(!logged_in_user)
    {
        throw new ApiError(200,"Only authorised user can surf a playlist")
    }
    const playlists= await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    if(!playlists)
    {
        throw new ApiError(400,"Playlistes not found")
    }
    return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched Successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Playlist ID is not Vald")
    }
    const user=await Users.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"Only authorised user can fetch a playlist")
    }
   const playlist= await Playlist.findOne(playlistId)
   if(!playlist)
   {
    throw new ApiError(400,"Playlist Not Found")
   }
   return res.status(200).json(new ApiResponse(200,playlist,"Playlist found successfully"))


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Vidoe Id is invalid")
    }
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Playlist Id is invalid")
    }
    const video= await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not found")
    }
    
    const playlist= await Playlist.findById(playlistId)
    if(!(toString(playlist.owner)===toString(req.user._id)))
    {
        throw new ApiError(400,"You are not authorized add video to this playlist")
    }
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
        
            $addToSet:{
                    videos:videoId
                }
            
        },
        {new:true}
        )
    if(!updatedPlaylist)
    {
        throw new ApiError(400,"Something went worng while Saving a video in playlist")
    }
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video Added to playlist SUCCESSFULLY"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Playlist Id is invalid")
    }
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Video Id is invalid")
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(400,"Playlist Not Found")
    }
    if(!(toString(playlist.owner)===toString(req.user._id)))
    {
        throw new ApiError(400,"You are not authorized to remove video from this playlist")
    }
    const video = await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"Video Not found")
    }
    const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                videos:videoId
            }
        },
        {new:true}
    )
    if(!updatedPlaylist)
    {
        throw new ApiError(400,"Video is not deleted from a playlist")
    }
    return res.status(200).json(new ApiResponse(200,updatePlaylist,"Playlist is Updated Successfully"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Playlist id is not valid")
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(400,"Playlist not found")
    }
    if(!(toString(playlist.owner)===toString(req.user._id)))
    {
        throw new ApiError(400,"You are not authorized to delete this playlist")
    }
    const deletedPlaylist= await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist)
    {
        throw new ApiError(400,"Playlist is not deleted")
    }
    return res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist is deleted Successfully"))

    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Playlist ID is not valid")
    }
    if(name.trim().length===0 || description.trim().length===0)
    {
        throw new ApiError(400,"Name and Description should't be empty")
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist)
    {
        throw new ApiError(400,"Playlist not found")
    }
    if(!(toString(playlist.owner)===toString(req.user._id)))
    {
        throw new ApiError(400,"You are not authorized to update this playlist")
    }
    const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,{
        name:name,
        description:description
    },{$new:true})

    return res.status(200).json(200,updatedPlaylist,"Playlist updated sucessfully")
        

    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}