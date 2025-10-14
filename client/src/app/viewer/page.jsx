"use client"

import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOKCET_URL = "http://localhost:5000"
const socket = io(SOKCET_URL);

export default function Viewer() {

    const videoRef = useRef()
    const pcRef = useRef(null)
    const [status, setStatus] = useState("idle");


    useEffect(()=>{

    socket.on("broadcaster",()=>{
        console.log("Broadcaster availble");
        socket.emit("Watcher");
        setStatus("watching");
    })

    socket.on("offer", async (broadcasterId, description)=>{

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event)=>{
            videoRef.current.srcObject = event.streams[0];
        }

        pc.onicecandidate = (e)=>{
            if(e.candidate){
                socket.emit("candidate", broadcasterId, e.candidate);
            }
        };


        await pc.setRemoteDescription(description);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
    })

    },[])

  return (
    <div>
      
    </div>
  )
}
