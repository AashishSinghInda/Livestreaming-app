"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import {
    RadioGroup,
    RadioGroupItem,
  } from "@/components/ui/radio-group"
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';



export let Videouploadmodal =({onClose}) => {
      const [publish, setPublish] = useState("public");
      const [title,setTitle] = useState('')
      const [description,setDescription] = useState('')
      const [thumImage,setThumImage] = useState('')
      const [video,setvideo]  = useState('')


      let obj ={
        title,
        description,
        thumImage,
        video
      }

      console.log(obj)

  let savevideo = (e)=>{
    console.log(e,"event target")
    e.preventDefault()

    let formvalue =new FormData(e.target)
     formvalue.append('publish', publish); 
      console.log(">>>>>>",FormData )

      


    try{
        console.log(process.env.NEXT_PUBLIC_API_URL,"env url", obj)
    let res = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uploads/video`,obj)
       console.log("res.data>>>>>>", res.data);
         toast.success("Video uploaded successfully!"); 
        e.target.reset();
        onClose();
  }
  catch(error){
    console.log("upload failed!...")
  }
}

    return(
      <>
        <ToastContainer/>
      <div className='flex justify-center  items-center h-screen bg-opacity-50  '>
        <Card className='w-[500px] relative'>
            <CardHeader className='text-2xl font-bold text-center flex justify-between items-center '>Upload Video 
              <button onClick={onClose} className='text-xl font-bold '>X</button>
            </CardHeader>
            <CardContent>
                <form onSubmit={savevideo}>
                      <Input type="text" name='title' placeholder='Enter Video Title...' className='border border-gray-400 my-[10px]'  require='Enter Video Title' onChange={(e)=> setTitle(e.target.value)}  value={title.name}/><br />
                      <Input type="text" name='description' placeholder='Enter Video description...' className='border border-gray-400 my-[10px]'  require='Enter Video description' onChange={(e)=> setDescription(e.target.value)} value={description.name} /><br />
                        <Input type="file" name='thumImage' placeholder='Upload Video ThumImage...' className='border border-gray-400  my-[10px]' accept="image/*"  onChange={(e)=> setThumImage(e.target.value)}
                        value = {thumImage.name} />
                          <Input type="file" name='video' placeholder='Upload Video...' className='border border-gray-400  my-[10px]' required  accept="video/*" onChange={(e)=> setvideo(e.target.value)}  value={video.name} />
                          <RadioGroup defaultValue="public"  onValueChange={setPublish}>
                          <div className="flex items-center space-x-2  mt-[10px]">
                                <RadioGroupItem value="public" id="public"  />
                                      <label htmlFor="public">Public</label>
                          </div>
                          <div className="flex items-center space-x-2 ">
                                <RadioGroupItem value="private" id="private"   />
                                      <label htmlFor="private">private</label>
                          </div>
                          <div className="flex items-center space-x-2  ">
                                <RadioGroupItem value="unlisted" id="unlisted"  />
                                      <label htmlFor="unlisted">Unlisted</label>
                          </div>
                          </RadioGroup>
                          <Button type='submit' className='cursor-pointer' >Video Upload</Button>
                        
                       
                </form>
            </CardContent>

        </Card>
      </div>
      </>
    )
  }