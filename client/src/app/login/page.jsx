"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'

export default function login() {

    let router = useRouter()

let [form, setForm] = useState({
   email : '',
   password : ''
})

const handleChange = (e)=>{
    setForm({...form, [e.target.name] : e.target.value})
}

const handleSubmit = async (e)=>{
    e.preventDefault()
    try{
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,form)
        localStorage.setItem("accessToken", res.data.accessToken)
        localStorage.setItem("refreshToken",res.data.refreshToken)
        localStorage.setItem("userInfo", JSON.stringify(res.data.userFilled))
        localStorage.setItem("userId",res.data.userFilled.userId)
       // console.log(res.data.userFilled)

        toast.success("Login Sucessfully! ")

        setTimeout(()=>{
          router.push('/')
        },2000)
        setForm({email: '', password : ''})
    }
    catch(error){
        toast.error("login failed",error)
    }
}

 // useEffect(()=>{
   //   let accesstoken = localStorage.getItem("accessToken")
   //   let refreshtoken = localStorage.getItem("refreshToken")

   //   if(accesstoken && refreshtoken){
   //     router.push("/")
    //  }
  //  },[router])

  return (
   <>
   <ToastContainer/>
   <div className='flex justify-center items-center h-screen'>
    <Card className='w-[400px]'>
        <CardHeader className='text-xl font-bold'>Login</CardHeader>
        <CardContent>
            <form className='flex flex-col gap-4'  onSubmit={handleSubmit}>
                <Input type='email' name='email' placeholder='Enter Your email...' className='border border-gray-400' onChange={handleChange} value={form.email} required autoComplete={'email'}></Input>
                <Input type='password' name='password' placeholder="Enter Your Password" className='border border-gray-400' onChange={handleChange} value={form.password} required autoComplete="password" />
                 <Button type='submit' className='cursor-pointer'>Login</Button>
            </form>
            <p className='py-[5px]'>
               Don't have an account? <span className='text-blue-800 cursor-pointer' onClick={()=> router.push('/register') }>Register here</span> 
            </p>
        </CardContent>
    </Card>
   </div>
   </>
  )
}
