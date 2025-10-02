"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'

export default function Register() {

  let router = useRouter()

  const [formvalue,setFormvalue] = useState({
    name : '',
    email : '',
    password : '',
    confirmPassword : '',
  })

  const handleChange = (e)=>{
      setFormvalue({...formvalue, [e.target.name] : e.target.value})
  }

  const handleSubmit = async (event)=>{
   event.preventDefault()
   try{
       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`,formvalue)
       toast.success("Registered Sucessfully !")

       setTimeout(()=>{
        router.push('/login')
       },2000)

       setFormvalue({name : '', email : '', password : '', confirmPasssword : ''})
   }
   catch(error){
    toast.error("Something went wrong")
   }
  }

    useEffect(()=>{
        let accesstoken = localStorage.getItem("accessToken")
        let refreshtoken = localStorage.getItem("refreshToken")
  
        if(accesstoken && refreshtoken){
          router.push("/")
        }
      },[router])



    return (
        <>
        <ToastContainer/>
                <div className='flex justify-center items-center h-screen'>
                <Card className='w-[400px]' >
                    <CardHeader className='text-2xl font-bold text-center'>Register</CardHeader>
                    <CardContent>
                         <form className='flex flex-col gap-4' onSubmit={handleSubmit} >
                        <Input type="text" name='name' placeholder='Enter Your Name...' className='border border-gray-400'  require='Enter your name'  onChange={handleChange} required value={formvalue.name}  />

                        

                        <Input type="email" name='email' placeholder='Enter Your Email...' className='border border-gray-400'
                          require='Enter your email'  onChange={handleChange}  required value={formvalue.email} autoComplete="new-email"/>


                        <Input type='password' name='password' placeholder="Enter Your Password" className='border border-gray-400'     onChange={handleChange}  required value={formvalue.password}  autoComplete="new-password"/>


                        <Input type='password' name='confirmPassword' placeholder="Enter Confirm Password" className='border border-gray-400'  onChange={handleChange}  required value={formvalue.confirmPassword}   />
                        <Button type='submit' className='cursor-pointer'>Register</Button>
                </form>
                <p className='py-[5px]'>
                  Already have an account {" "}
                  <span className='text-blue-800 cursor-pointer ' onClick={()=> router.push('/login')}>Login here </span>
                </p>
                    </CardContent>
                </Card>
                </div>
          

        </>

    )
}
