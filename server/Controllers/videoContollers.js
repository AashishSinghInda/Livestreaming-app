import video from "../Model/video.js"


export const uploadVideo = async (req, res)=>{
  try{

     console.log(req.body)
   console.log(req.files)
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