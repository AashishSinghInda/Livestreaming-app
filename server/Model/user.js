import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    accessToken : {
        type : String,
        default : null
    },
    refreshToken : {
        type : String,
        default : null
    }
})

export default mongoose.model('user',userSchema)