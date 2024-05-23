import mongoose from "mongoose";

const playlistSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
    ,
    description:{
        type:String,
        required:true

    }
    ,videos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Videos"
        }
    ]
    ,owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
})
const Playlist=new mongoose.model("Playlist",playlistSchema)
export default Playlist