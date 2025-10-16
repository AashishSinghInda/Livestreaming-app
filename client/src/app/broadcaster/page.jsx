"use client"

 import React, {  useEffect, useRef, useState } from 'react'
 import io from 'socket.io-client';
 

const SOCKET_URL = 'http://192.168.29.141:5000'; 

  export default function BroadCaster(){

    const [isModalOpen,setIsModalOpen] = useState(false)
    const [title,setTitle] = useState('');
    const [desc, setDesc] = useState('')
    const [isLive, setIslive] = useState(false)
    const [showSetup, setShowSetup] = useState(true)
    const [showLiveSection, setShowLiveSection] = useState(false)
    const [localStream, setLocalStream] = useState(null);
    const [liveId, setLiveId] = useState(null);

    const previewVideoRef = useRef(null);
    const liveVideoRef = useRef(null);   
    const socketRef = useRef(null);
    const peersRef = useRef(new Map());



  


  useEffect(() => {
  socketRef.current = io(SOCKET_URL, {
    transports: ['websocket'], 
    reconnection: true,
  });

  socketRef.current.on('connect', () => {
    console.log('Broadcaster Socket connected :', socketRef.current.id);
  });

  socketRef.current.on('connect_error', (err) => {
    console.error('Socket connection error :', err.message);
  });

  socketRef.current.on('disconnect', () => {
    console.warn('Socket disconnected.  Trying to reconnect... ');
  });

  return () => {
    socketRef.current.disconnect();
  };
}, []);


    const handleGoLive = async ()=>{
      setIsModalOpen(true)

      try{
        const stream = await navigator.mediaDevices.getUserMedia({video : {width : 1280, height: 720}, audio : false})
        setLocalStream(stream)

       if(previewVideoRef.current){
          previewVideoRef.current.srcObject = stream;
        }
     }
      catch(err){
        alert("camera access not available")
        setLocalStream(null);
        closeModal();
      }
    };


    const handleStartLive = () => {
    if (!title.trim()) {
      alert('Please enter a title!');
      return;
    }
     if (!localStream) {  
      alert(' Please try Go Live again');
      return;
    }
    if(socketRef.current && socketRef.current.connected){
      socketRef.current.emit('start-live', { title, desc });
    setShowSetup(false);
    setIslive(true);
    setShowLiveSection(true);
   // setLocalStream(null);
    if (liveVideoRef.current && localStream) {
      liveVideoRef.current.srcObject = localStream;
    }
   setIsModalOpen(false);
      console.log('Emitting start-live with stream:', localStream.getTracks().length > 0 ? 'Tracks available' : 'No tracks');
  }
  else{
    console.error('socket not connected, cannot start live')
  }}



  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on('live-started', ({ liveId: id }) => setLiveId(id));
    return () => socket.off('live-started');
  },[]);
   


 


  useEffect(() => {
  const socket = socketRef.current;
  if (!socket || !localStream || !liveId) return;

  // Viewer joined handler (your existing code — keep as-is or use this copy)
  socket.on('viewer-joined', async ({ viewerId, liveId: joinedLiveId }) => {
    if (joinedLiveId !== liveId) return;
    console.log(`Viewer ${viewerId} joined for live ${joinedLiveId}`); 
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Add tracks to peer
    if (localStream.getVideoTracks().length > 0) {
      localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    } else {
      console.error('No video tracks in localStream! Camera access may be denied.');
      socket.emit('error', { message: 'No video tracks in broadcaster stream' });
      return;
    }

    // Relay ICE candidates to viewer
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { candidate: e.candidate, liveId: joinedLiveId, viewerId });
        console.log('Broadcaster: sent ICE candidate to viewer', viewerId);
      }
    };

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('offer', { offer, viewerId, liveId: joinedLiveId });
      peersRef.current.set(viewerId, peer);
      console.log('Broadcaster: offer sent to viewer', viewerId);
    } catch (error) {
      console.error('Error creating offer for viewer', viewerId, error);
    }
  });

  // --- FIX ---: handle answers with clearer naming & guards
  socket.on('answer', async ({ answer, viewerId, liveId: answerLiveId }) => {
    if (answerLiveId !== liveId) return;
    const peer = peersRef.current.get(viewerId);
    if (!peer) {
      console.warn('Broadcaster: no peer found for viewer', viewerId);
      return;
    }
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Broadcaster: set remote description (answer) for viewer', viewerId);
    } catch (err) {
      console.error('Broadcaster: failed to set remote description for viewer', viewerId, err);
    }
  });

  // --- FIX ---: handle ICE candidates from viewer
  socket.on('ice-candidate', ({ candidate, viewerId, liveId: candidateLiveId }) => {
    if (candidateLiveId !== liveId) return;
    const peer = peersRef.current.get(viewerId);
    if (!peer) {
      console.warn('Broadcaster: no peer to add candidate for viewer', viewerId);
      return;
    }
    if (!candidate) return;
    peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
      console.error('Broadcaster: failed to add ICE candidate for viewer', viewerId, err);
    });
  });

  return () => {
    socket.off('viewer-joined');
    socket.off('answer');
    socket.off('ice-candidate');
  };
}, [localStream, liveId]);





useEffect(() => {
  if (previewVideoRef.current && localStream && isModalOpen && showSetup) {
    previewVideoRef.current.srcObject = localStream;
    previewVideoRef.current.play().catch(console.error);
  }
  return () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };
}, [localStream, isModalOpen, showSetup]);




useEffect(() => {
  if (liveVideoRef.current && localStream && showLiveSection) {
    liveVideoRef.current.srcObject = localStream;
    liveVideoRef.current.play().catch(console.error);
  }
  return () => {
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };
}, [localStream, showLiveSection]);



  const handleStopLive = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
     // setLocalStream( null);
    }

     peersRef.current.forEach(peer => peer.close());
    peersRef.current.clear();
    if (liveId  && socketRef.current && socketRef.current.connected){
       socketRef.current.emit('stop-live', { liveId });
  }
    setLocalStream(null);
    setIslive(false);
    setShowLiveSection(false);
    setShowSetup(true);
    setTitle('');
    setDesc('');
    setLiveId(null);
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
     setIsModalOpen(false);
    closeModal();
    console.log('Live stopped and cleaned up>>>>>>>>>>>>>6');
  };



    const closeModal = () => {
    setIsModalOpen(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
    setShowSetup(true);
    setIslive(false);
    setShowLiveSection(false);
    setTitle('');
    setDesc('');
    setLiveId(null);
  };



    return(
      <>

        <div className='max-w-4xl mx-auto text-center p-5 bg-gray-100 min-h-screen'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>Go Live</h1>
          <p className="text-gray-600 mb-6">Click start a live stream!</p>

          <button onClick={handleGoLive} className='bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md'> Go Live
          </button>

          {showLiveSection && (
             <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
               <h2 className="text-2xl font-bold text-red-500 mb-2">
                   Live Now: <span className="text-gray-800">{title}</span>
            </h2>
            <p className="text-gray-600 mb-4">{desc}</p>
            <div className="relative">
              <video
                ref={liveVideoRef}
                autoPlay
                muted
               
                className="w-full max-w-3xl h-96 border-2 border-red-500 rounded-xl bg-black"
              />
               {isLive && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded font-bold">
                  LIVE
                </div>
              )}
            </div>
            <button
              onClick={handleStopLive}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Stop Live
            </button>
          </div>
        )}
      </div>



      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' onClick={(e)=> {if(e.target === e.currentTarget && !isLive) closeModal()}}>
           <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-2xl">
         <h2 className="text-2xl font-bold text-red-500 text-center mb-6">Start Your Live Stream</h2>

           <div className={showSetup ? 'block' : 'hidden'}>
           <label className="block text-gray-700 font-semibold mb-1">Title:</label>
           <input
             type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)}
             className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
           />
           <label className="block text-gray-700 font-semibold mb-1">Description:</label>
           <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
               placeholder="Enter description..."
             className="w-full p-3 mb-4 border border-gray-300 rounded-lg h-20"
           />

              <div className="relative mb-4">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  className="w-full h-80 border-2 border-gray-300 rounded-lg bg-black mb-4"
                />
                {isLive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded font-bold">
                    LIVE
                  </div>
                )}
              </div>
            
            <div className='flex space-x-3'>
          <button
                  onClick={handleStartLive}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Start Live
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                </div>
                </div>


            </div>
            </div>
      )}
</>
    )
  }