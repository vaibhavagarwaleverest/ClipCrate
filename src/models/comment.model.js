import mongoose from "mongoose";

const commentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Videos"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
})

const Comment=new mongoose.model("Comment",commentSchema)

export default Comment