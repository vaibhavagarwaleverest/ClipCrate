import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    content:
    {
        type:"String",
        required:true
    }
})

export const Tweet=mongoose.model("Tweet",tweetSchema);

