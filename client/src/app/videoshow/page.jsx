"use client"

import React from 'react'
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function VideoShow() {

  const [videos,setVideos] = useState([])
     const [loading,setLoading] = useState(true)
  console.log("videos>>>>>>>",videos)
  
  
     useEffect(()=>{
      console.log("video update",videos)
        fetchVideos();
     },[])
  
     const fetchVideos = async ()=>{
      try{
          setLoading(true)
          
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/uploads/videoshow`);
          const finalRes = response.data;
         console.log("API response",finalRes)
  
  
          if(finalRes.status === 1){
            setVideos(finalRes.videos ||  []);
  
          if(finalRes.videos?.length === 0){
            toast.info('No public video available now.')
          }
           setLoading(false);
     }
     else{
       toast.error('Failed to load videos');
         setLoading(false);
     }
    }
    catch(error){
      const msg = 'Error loading videos';
      setVideos([]);
      setLoading(false)
              
  
    }  
    

  return (
    <>

          <div className="container mx-auto p-4 bg-white min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Public Videos</h1>
          <p className="text-gray-600">Watch and enjoy public videos</p>
          <button
            onClick={fetchVideos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading} // NEW: Disable button while loading to prevent spam clicks
          >
            {loading ? 'Loading...' : 'Refresh Videos'} {/* NEW: Show loading text on button */}
          </button>
        </div>


        {loading ? (
          <div className="text-center py-12">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading videos...</p>
               </div>
        ) : videos.length === 0 ? ( // No change: This now only shows after loading=false
        <div className="text-center text-gray-500 py-12">
             <h2 className="text-2xl font-semibold mb-4">No Public Videos Yet</h2> 
                <p>Upload your first public video to see it here!</p>
                      <button
              onClick={fetchVideos}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              disabled={loading} // NEW: Disable retry while loading
            >
              {loading ? 'Loading...' : 'Retry Fetch'} {/* NEW: Show loading text */}
            </button>
          </div>
        ) : (

          
              
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
            {videos.map((video,index) => (
                
                <Card key={video._id} className="w-full shadow-md hover:shadow-lg transition-shadow">
                {/* Thumbnail Image (YouTube style) - No major change, but ensure backend serves /uploads/thum/ */}
              
                <CardHeader className="p-0">
                  {video.thumbnailPath ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/thum/${video.thumbnailPath}`} // Ensure backend static serve for /uploads/thum
                      alt={video.title}
                              width={400}
                      height={225}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg'; // Ensure this file exists in /public
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center rounded-t-lg text-gray-500">
                      No Thumbnail
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {video.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Status: {video.publish}</span>
                    <span>Views: Coming Soon</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
       
      </div>
    </>
  )}}

