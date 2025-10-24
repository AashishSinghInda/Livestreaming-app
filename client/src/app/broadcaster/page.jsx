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
    const [isScreenSharing, setIsScreenSharing] =useState(false)
    const [screenStream, setScreenStream] = useState(null)

    const previewVideoRef = useRef(null);
    const liveVideoRef = useRef(null); 
      const cameraOverlayRef = useRef(null);  
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
},[]);


    const handleGoLive = async ()=>{
      setIsModalOpen(true)

      try{
        const stream = await navigator.mediaDevices.getUserMedia({video : {width : 1280, height: 720}, audio : true})
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
    if (liveVideoRef.current && localStream){
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

  socket.on('answer', async ({ answer, viewerId, liveId: answerLiveId }) => {
  if (answerLiveId !== liveId) return;
  const peer = peersRef.current.get(viewerId);
  if (!peer) {
    console.warn('No peer found for viewer', viewerId);
    return;
  }
  try {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
    console.log('Broadcaster: set remote description from viewer', viewerId);
  } catch (err) {
    console.error('Broadcaster: error setting remote description', err);
  }
});


  socket.on('viewer-joined', async ({ viewerId, liveId: joinedLiveId }) => {
 if (joinedLiveId !== liveId) {
    console.warn('viewer-joined for different liveId', joinedLiveId, 'expected', liveId);
    return;
  }
  console.log(`Viewer ${viewerId} joined for live ${joinedLiveId}`);

  const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // add camera+mic tracks (ensure tracks exist)
  if (localStream) {
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
  } else {
    console.error('No localStream when viewer joined!');
    socket.emit('error', { message: 'No broadcaster stream available' });
    return;
  }

  // if screen sharing active, add screen track
  if (screenStream) {
    const screenTrack = screenStream.getVideoTracks()[0];
    if (screenTrack) peer.addTrack(screenTrack, screenStream);
  }

  // forward ICE candidates to viewer
  peer.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('ice-candidate', { candidate: e.candidate, liveId: joinedLiveId, viewerId });
      console.log('Broadcaster: sent ICE candidate to viewer', viewerId);
    }
  };

  try {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    // IMPORTANT: emit offer directly to viewer (server forwards to viewer)
    socket.emit('offer', { offer, viewerId, liveId: joinedLiveId });
    peersRef.current.set(viewerId, peer);
    console.log('Broadcaster: offer sent to viewer', viewerId);
  } catch (error) {
    console.error('Error creating offer for viewer', viewerId, error);
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
}, [localStream, liveId, screenStream]);





useEffect(() => {
  if (previewVideoRef.current && localStream && isModalOpen && showSetup) {
    previewVideoRef.current.srcObject = localStream;
    previewVideoRef.current.play().catch(console.error);
     if (cameraOverlayRef.current) {
        cameraOverlayRef.current.srcObject = localStream;
        cameraOverlayRef.current.play().catch(() => {});
      }
  }
  return () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    if (cameraOverlayRef.current) cameraOverlayRef.current.srcObject = null;
  };
}, [localStream, isModalOpen, showSetup]);




useEffect(() => {
  if (liveVideoRef.current && localStream && showLiveSection) {
    liveVideoRef.current.srcObject = localStream;
    liveVideoRef.current.play().catch(console.error);

    if (cameraOverlayRef.current) {
        cameraOverlayRef.current.srcObject = localStream;
        cameraOverlayRef.current.play().catch(() => {});
      }

  }
  return () => {
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    if (cameraOverlayRef.current) cameraOverlayRef.current.srcObject = null;
  };
}, [localStream, showLiveSection]);



  const handleStopLive = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
     // setLocalStream( null);
    }


    if(screenStream){
      screenStream.getTracks().forEach(t => t.stop());
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
      if (cameraOverlayRef.current) cameraOverlayRef.current.srcObject = null;
     setIsModalOpen(false);
      setIsScreenSharing(false);
       setScreenStream(null);
    console.log('Live stopped and cleaned up>>>>>>>>>>>>>6');
  };



    const closeModal = () => {
    setIsModalOpen(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if(screenStream){
      screenStream.getTracks().forEach(t => t.stop())
      setScreenStream(null);
    }
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
     if (cameraOverlayRef.current) cameraOverlayRef.current.srcObject = null;
    setShowSetup(true);
    setIslive(false);
    setShowLiveSection(false);
    setTitle('');
    setDesc('');
    setLiveId(null);
    setIsScreenSharing(false);
  };


  // start screen share 

  const handleStartScreenShare = async()=>{
    if(!localStream){
      alert('Start camera (Go Live) first so audio is available')
      return;
    }
    try {
      // getDisplayMedia may or may not include system audio depending on the browser & permissions
      const sStream = await navigator.mediaDevices.getDisplayMedia({
         video:{
          cursor : "always",
          displaySurface: "monitor"
       },
       audio : false
     } );
      setScreenStream(sStream);
      setIsScreenSharing(true);


      // Keep camera audio/video available locally
      const camTrack = localStream.getVideoTracks()[0];
      const micTracks = localStream.getAudioTracks();

      // Create combined preview stream for broadcaster UI: show screen as main and camera as small overlay using two <video> elements
      if (previewVideoRef.current) previewVideoRef.current.srcObject = sStream; // main shows screen
      if (liveVideoRef.current) liveVideoRef.current.srcObject = sStream; // live main shows screen
      if (cameraOverlayRef.current && camTrack) {
        // camera overlay will show camera track in small div
        const camStreamForOverlay = new MediaStream([camTrack, ...micTracks]);
        cameraOverlayRef.current.srcObject = camStreamForOverlay;
        cameraOverlayRef.current.play().catch(()=>{});
      }

      // Notify viewers via socket to expect screen + camera overlay (helps UI toggling)
      if (socketRef.current && socketRef.current.connected && liveId) {
        socketRef.current.emit('screen-share-started', { liveId });
      }

      // For each connected peer: add the screen track so viewers receive both tracks (camera track was already added at start)
      const screenTrack = sStream.getVideoTracks()[0];
       peersRef.current.forEach((peer, viewerId) => {
        const senders = peer.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          // Replace existing camera video with screen
          videoSender.replaceTrack(screenTrack).then(() => {
            console.log('Replaced camera with screen for viewer', viewerId);
            // Add camera as additional track (so viewers get screen first, camera second)
            peer.addTrack(camTrack, localStream);
          }).catch(err => console.error('Error replacing track for screen share', err));
        } else {
          // Fallback: if no video sender, add screen
          peer.addTrack(screenTrack, sStream);
        }
      });

      // When user stops screen share with browser UI, revert automatically
      const screenTrackLocal = sStream.getVideoTracks()[0];
      if (screenTrackLocal) {
        screenTrackLocal.onended = () => {
          console.log('Screen share ended by user');
          handleStopScreenShare();
        };
      }

    } catch (err) {
      console.error('Screen share error', err);
      alert('Could not start screen sharing: ' + (err.message || err));
      setIsScreenSharing(false);
    }
  }










 // Stop screen sharing and restore camera video to viewers
  // STOP screen sharing: remove added screen senders and restore preview/live to camera stream
  



  const handleStopScreenShare = async () => {
    if (!isScreenSharing) return;
    // stop screen local tracks
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
    }
    setIsScreenSharing(false);
    setScreenStream(null);
    // Revert broadcaster preview/live to camera stream
    if (previewVideoRef.current && localStream) previewVideoRef.current.srcObject = localStream;
    if (liveVideoRef.current && localStream) liveVideoRef.current.srcObject = localStream;
    if (cameraOverlayRef.current && localStream) cameraOverlayRef.current.srcObject = localStream;
     // FIX: Replace screen sender back to camera, and remove the extra camera sender
    peersRef.current.forEach((peer, viewerId) => {
      const senders = peer.getSenders();
      const videoSenders = senders.filter(s => s.track && s.track.kind === 'video');
      if (videoSenders.length >= 2) {
        // Assume first is screen, second is camera (from our addition)
        videoSenders[0].replaceTrack(localStream.getVideoTracks()[0]).then(() => {
          console.log('Replaced screen back to camera for viewer', viewerId);
          // Remove the extra camera sender
          peer.removeTrack(videoSenders[1]);
        }).catch(err => console.error('Error replacing back to camera', err));
      }
    });
    // Notify viewers via socket to hide overlay
    if (socketRef.current && socketRef.current.connected && liveId) {
      socketRef.current.emit('screen-share-stopped', { liveId });
    }
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
               {/* NEW: small camera overlay inside broadcaster live view */}
            <video
              ref={cameraOverlayRef}
              autoPlay
              muted
              playsInline
              className="w-28 h-20 rounded-lg border-2 border-white absolute bottom-3 right-3 bg-black"
              style={{ objectFit: 'cover' }}
            />
            </div>


              <div className='flex gap-3 justify-center mt-4'>
                {!isScreenSharing ? (
                  <button
                  onClick={handleStartScreenShare}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Share Screen
                  </button>
                ) : (
                 
                   <button
                onClick={handleStopScreenShare}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Stop Sharing
              </button>
                )}
            <button
              onClick={handleStopLive}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Stop Live
            </button>
          </div>
          </div>
        )}



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
                {/* NEW: small camera overlay inside preview modal */}
              <video
                ref={cameraOverlayRef}
                autoPlay
                muted
                playsInline
                className="w-24 h-16 rounded-lg border-2 border-white absolute bottom-3 right-3 bg-black"
                style={{ objectFit: 'cover' }}
              />
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
      </div>
</>
)
}