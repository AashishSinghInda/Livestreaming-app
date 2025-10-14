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
import Link from 'next/link';

  


  export default function Header() {

    let router = useRouter()

    const [position, setPosition] = useState("bottom")
    const [show, setShow] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [open , setOpen] =  useState(false)
  
    useEffect(()=>{
      let accessToken = localStorage.getItem("accessToken")
      let refreshToken = localStorage.getItem("refreshToken")

      if(!accessToken && !refreshToken){
        setShow(true)
        setIsLoggedIn(false)
      }
      else{
        setShow(false)
        setIsLoggedIn(true)
      }

    },[]) 

   

   const handleCreateClick = ()=>{
    
    if(!isLoggedIn){
      toast.error("Please log in create videos or go live!");
       setOpen(false); 
      setTimeout(()=>{
        router.push('login')
      },4000)
        return

    }}


   const handleOpenChange = (newOpen)=>{
     if(!isLoggedIn && newOpen){
      setOpen(false)
      handleCreateClick()
     }
     else {
      setOpen(newOpen);
    }}
    
    
    

    let logout = async ()=>{
      try{
          let userId = localStorage.getItem("userId")

          await  axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,{userId})

          localStorage.removeItem('userInfo')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')

          toast.success("logout Successfully!...")

            setOpen(false);
            setShow(true);
               setIsLoggedIn(false);

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
              <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='cursor-pointer' onClick={handleCreateClick}>+ Create</Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Create video</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                <DropdownMenuRadioItem value="Upload" onSelect={() => setShowUploadModal(true)}>
                  upload
                </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="GoLive"><Link href={'/broadcaster'}> GoLive </Link></DropdownMenuRadioItem>
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





