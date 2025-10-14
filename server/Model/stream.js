import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    desc : {
        type : String,
        default : '',
    },
    broadcasterSocketId : {
        type : String,
    },
    isLive : {
        type : Boolean,
        default : false
    },
    startedAt : {
        type : Date,
    },
    stoppedAt: {
        type : Date,
    },
}   
)

export default mongoose.model('stream',streamSchema)