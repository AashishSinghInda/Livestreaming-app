import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    title :{
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    thumbnailPath : {
        type : String,
    },
    videopath : {
        type : String,
        required : true
    },
    publish: {
        type : String,
        enum  : ['public', 'private', 'unlisted'],
        required : true
    },
    createAt:{
        type : Date,
        default : Date.now,
    }
})

export default mongoose.model("video", videoSchema)