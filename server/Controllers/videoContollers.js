import video from "../Model/video.js"


export const uploadVideo = async (req, res)=>{
  try{

    const {title, description, publish} = req.body


      if(!['private', 'public', 'unlisted'].includes(publish)){
       return res.status(400).json({message : "publish somethings errors!..."})
  }

      if(!title || !description){
       return  res.status(400).json({message : "ttile and description are required!..."})
      }

      if(!req.files || !req.files.video || !req.files.video[0]){
        return res.status(400).json({message : "video files is required!..."})
      }


      if (!req.files.thumImage || !req.files.thumImage[0]) {
      console.log("No thumbnail image");
    }

      let obj = {
        title,
        description,
        publish,
      }

      
    if (req.files.thumImage && req.files.thumImage[0]) {
      obj['thumbnailPath'] = req.files.thumImage[0].filename;  
    }

     if (req.files.video && req.files.video[0]) {
      obj['videopath'] = req.files.video[0].filename;  
    }


    let videoRes = await video.create(obj);


    const responseObj = {
      status : 1,
      msg : "Thumbnail and video save successfully!",
      video : videoRes
    };

       return res.status(200).json(responseObj)
  /*   const Video = new video({
        title,
        description,
        thumbnailPath,
        videopath,
        publish,
        
      })

       console.log(Video)   
      await Video.save();

      res.status(200).json({message : "video uploaded sucessfully", video})   */
  }


  catch(error){
     res.status(500).json({message : "video Uploads errors"})
  }
}









export const showvideo = async (req,res)=>{
//  let backurl = "http://localhost:5000/upload/video";
  try{
    if(req.params.id){

      const videoId = req.params.id;
      const videoDoc = await video.findById(videoId)

      if(!videoDoc){
        return res.status(404).json({message : "video not found"})
      }

      if(videoDoc.publish === "private"){
        return res.status(404).json({message : "This video is private"})
      }

      return res.status(200).json({
        status : 1,
        msg : ' video used  successfully!',
        videoDoc
      })
    }
    else {
      const  videos = await video.find({publish : 'public'})

      return res.status(200).json({
        status : 1,
        msg : "public video used successfully!...",
        videos : videos,
      //  backurl
      })
    }
  }
  catch(error){
    res.status(500).json({message : "video show problem!..."})
  }
}




