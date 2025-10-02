  "use client"


  import { useRouter } from 'next/navigation';
  import React, {  useEffect, useState } from 'react'
  import { FaYoutube } from "react-icons/fa";
  import { FaRegUserCircle } from "react-icons/fa";
  import { Button } from "@/components/ui/button"
  import {DropdownMenu,DropdownMenuContent,DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
  import axios from 'axios';
  import { toast, ToastContainer } from 'react-toastify';
import { Videouploadmodal } from './videoModel';
  //import { Card, CardContent, CardHeader } from '@/components/ui/card';
  //import { Input } from '@/components/ui/input';
  //import {
   // RadioGroup,
    //RadioGroupItem,
  //} from "@/components/ui/radio-group"


  export default function Header() {

    let router = useRouter()

    const [position, setPosition] = useState("bottom")
    const [show, setShow] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false);
  
    useEffect(()=>{
      let accessToken = localStorage.getItem("accessToken")
      let refreshToken = localStorage.getItem("refreshToken")

      if(!accessToken && !refreshToken){
        setShow(true)
      }

    },[]) 
    
    

    let logout = async ()=>{
      try{
          let userId = localStorage.getItem("userId")

          await  fetch.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,{userId})

          localStorage.removeItem('userInfo')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')

          toast.success("logout Successfully!...")

          setTimeout(()=>{
            router.push('/login')
          },2000)
      }
      catch(error){
        toast.error("logout failed")
      }
    }
  

  

    return (
      <>
      <ToastContainer/>
        {/* main div */}
        <div className='flex justify-between bg-white p-[20px]'>

          {/* live streamning app div */}
          <div className='flex items-center gap-[10px] text-2xl'><FaYoutube /> LiveStreaming</div>

          {/* right side div */}
          <div className='flex items-center gap-[20px] '>

            
          
        
            {/* dropdown div */}
              
            <div className=' cursor-pointer'>
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='cursor-pointer'>+ Create</Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Create video</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
               `` <DropdownMenuRadioItem value="Upload" onSelect={() => setShowUploadModal(true)}>
                  upload
                </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="GoLive">GoLive</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          </DropdownMenuContent>
              </DropdownMenu>
            </div>
              
              
              
            {/* sign Up div */}
            {show ?
            <div className='border-2 border-black rounded-2xl p-[5px_17px]  cursor-pointer flex items-center gap-[10px] '><FaRegUserCircle className='text-xl' /> <span onClick={() => router.push('/register')}>Sign Up</span> </div>
              :
          <button onClick={logout} className='border-2 border-black p-[5px_17px] rounded-2xl cursor-pointer'>Logout</button>
            }
          
          </div>

        </div>

        {/* Modal show */}
        {showUploadModal && <Videouploadmodal onClose={() => setShowUploadModal(false)} />}
      </>
    )
  }





 /* let Videouploadmodal =({onClose}) => {
      const [publish, setPublish] = useState("public");

  let savevideo = (e)=>{
    e.preventDefault()

    let formvalue =new FormData(e.target)
     formvalue.append('publish', publish); 


    try{
    let res = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uploads/video`,formvalue)
       console.log(res.data);
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
        
      <div className='flex justify-center  items-center h-screen bg-opacity-50  '>
        <Card className='w-[500px] relative'>
            <CardHeader className='text-2xl font-bold text-center flex justify-between items-center '>Upload Video 
              <button onClick={onClose} className='text-xl font-bold '>X</button>
            </CardHeader>
            <CardContent>
                <form onSubmit={savevideo}>
                      <Input type="text" name='title' placeholder='Enter Video Title...' className='border border-gray-400 my-[10px]'  require='Enter Video Title' /><br />
                      <Input type="text" name='description' placeholder='Enter Video description...' className='border border-gray-400 my-[10px]'  require='Enter Video description' /><br />
                        <Input type="file" name='thumImage' placeholder='Upload Video ThumImage...' className='border border-gray-400  my-[10px]' accept="image/*" />
                          <Input type="file" name='video' placeholder='Upload Video...' className='border border-gray-400  my-[10px]' required  accept="video/*" />
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
                          <Button type='submit' className='cursor-pointer'>Video Upload</Button>
                        
                       
                </form>
            </CardContent>

        </Card>
      </div>
      </>
    )
  }  */ 
