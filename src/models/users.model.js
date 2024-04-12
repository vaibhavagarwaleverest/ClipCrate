import mongoose from "mongoose";


const usersSchema= new mongoose.Schema({

    watchHistory:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Videos"

        }
    ],
    
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true

    
    },
    password:{
        type:String,
        required:[true,'password is required'],

    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    avatar:{
        type:String,   // Cloudinary URL
        required:true

    },
    coverImage:{
        type:String,
        required:true
    },
 
    refreshToken:{
        type:String,
    }
    
},{timestamps:true})


export const Users=mongoose.model("Users",usersSchema);