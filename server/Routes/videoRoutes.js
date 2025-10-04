import express from "express"
import { showvideo, uploadVideo } from "../Controllers/videoContollers.js"
import multer from "multer"

let videoRoutes = express.Router()

let storage = multer.diskStorage({

    //if file.type == image 
    destination : function(req,file,cb){
        cb(null,"upload/thum")
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)

}
})


const upload1 = multer({storage : storage})


videoRoutes.post("/video", upload1.fields([{ name: 'thumImage', maxCount: 1 }, { name: 'video', maxCount: 8 }]), uploadVideo)

videoRoutes.get("/videoshow",showvideo);
videoRoutes.get("/videoshow/:id",showvideo)


export {videoRoutes}