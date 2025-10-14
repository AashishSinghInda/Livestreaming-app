"use client"

import axios from "axios";
import { useEffect, useState,useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.29.141:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function Home() {

 // const apiurl = process.env.NEXT_PUBLIC_API_URL;

//  console.log(apiurl);

  const [videos, setVideos] = useState([])
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true)
  const [liveModal, setLiveModal] = useState({ open: false, liveId: null });
  const [remoteStream, setRemoteStream] = useState(null);
  const [backurl, Setbackurl] = useState([]);


 const videoRef = useRef(null); 
  const socketRef = useRef(null);
  const peerRef = useRef(null);


    const fetchVideos = async ()=>{
     try{
         setLoading(true)

         const response = await axios.get(`${API_URL}/uploads/videoshow`);
         const finalRes = response.data;
        console.log("API response",response)


         if(finalRes.status === 1){
           setVideos(finalRes.videos ||  []);
         //  Setbackurl(response.data.backurl)

         if(finalRes.videos?.length === 0){
           toast.info('No public video available now.')
         }
       //1   setLoading(false);
    }
    else{
      toast.error('Failed to load videos');
      //1  setLoading(false);
    }
   }
   catch(error){
    toast.error('Error loading videos')
     setVideos([]);
     
  } 
    finally{
      setLoading(false)
    }}


  const fetchLives = async () => {
    try {
      const response = await axios.get(`${API_URL}/streams`);
      if (response.data.status === 1) {
        setLives(response.data.lives || []);  
      }
    } catch (error) {
      console.error('Error fetching lives:', error);
    }
  }  



    useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    // Listen for new live
    socketRef.current.on('live-started', (data) => {
      setLives(prev => [...prev, { _id: data.liveId, title: data.title, desc: data.desc, isLive: true }]);
      toast.success(`New live started: ${data.title}`);
    });
    // Listen for live stopped
    socketRef.current.on('live-stopped', ({ liveId }) => {
      setLives(prev => prev.filter(live => live._id !== liveId));
      if (liveModal.liveId === liveId) {  
       closeLiveModal();
      }
        toast.info('Live stream ended.');
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchLives();
  }, [])


  const handleRefresh = ()=>{
    fetchVideos();
    fetchLives()
  };



   const watchLive = async (liveId) => {
    setLiveModal({ open: true, liveId });
    socketRef.current.emit('join-live', { liveId }); // Tell backend/streamer
    // Create peer connection
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    // Handle remote stream
    peerRef.current.ontrack = (event) => {
      console.log(`Remote track received:`, event.streams[0]);
      if (event.streams[0].getVideoTracks().length > 0) {  
        setRemoteStream(event.streams[0]);
      }
      else {
        console.error('No video tracks in remote stream');  // एरर लॉग
        toast.error('No video stream available');
      }
    };
    // Handle ICE candidates
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          liveId,
        });
      }
    };
  }

  // new
  useEffect(()=>{
     if (!socketRef.current || !liveModal.open) return;
    const liveId = liveModal.liveId;

     const handleOffer = async ({ offer, liveId: id }) => {
      if (id !== liveId) return;
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { answer, liveId: id });
    };

    const handleIce = ({ candidate, liveId: id }) => {
      if (id !== liveId || !candidate || !peerRef.current) return; // FIXED: Changed !== to ===, added checks
      peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

      socketRef.current.on('offer', handleOffer);
    socketRef.current.on('ice-candidate', handleIce);
    // Cleanup on unmount or modal close
    return () => {
      socketRef.current.off('offer', handleOffer);
      socketRef.current.off('ice-candidate', handleIce);
    };
  }, [liveModal.open, liveModal.liveId]);
  


   useEffect(() =>                                    {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(console.error); // ADDED: Auto-play
    }
  }, [remoteStream]);
  // Close live modal with full cleanup
  const closeLiveModal = () => {
    setLiveModal({ open: false, liveId: null });
    setRemoteStream(null);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null; // FIXED: Full cleanup
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  
   const allContent = [
    ...videos.map(v => ({ ...v, type: 'video' })),
    ...lives.map(l => ({ ...l, type: 'live' })) 
  ];
  


   

 

 

  return (
    <>
     <ToastContainer />
      <div className="container mx-auto p-4 bg-white min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Public Videos & Lives</h1> {/* UPDATED: Mention lives */}
          <p className="text-gray-600">Watch and enjoy public videos and live streams</p>
          <button
            onClick={handleRefresh} // FIXED: Use handleRefresh (calls both fetches)
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'} {/* SIMPLIFIED: Generic text */}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading content...</p> {/* UPDATED: Generic */}
          </div>
        ) : allContent.length === 0 ? ( // FIXED: Check allContent (videos + lives)
          <div className="text-center text-gray-500 py-12">
            <h2 className="text-2xl font-semibold mb-4">No Public Videos or Lives Yet</h2> {/* UPDATED: Include lives */}
            <p>Upload your first public video or start a live stream to see it here!</p>
            <button
              onClick={handleRefresh} // FIXED: Use handleRefresh
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Retry Fetch'}
            </button>
          </div>
        ) : (
           // NEW/FIXED: Grid for both videos and lives
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allContent.map((item) => {
              if (item.type === 'video') {
                // Original video rendering (unchanged)
                const videoSrc = item.videopath ? `${process.env.NEXT_PUBLIC_CLOUD_URL}/upload/video/${item.videopath}` : null;
                const thumbnailSrc = item.thumbnailPath ? `${process.env.NEXT_PUBLIC_CLOUD_URL}/upload/thum/${item.thumbnailPath}` : null;
                return (
                  <Card key={item._id} className="w-full shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0 relative">
                      {videoSrc ? (
                        <video
                          src={videoSrc}
                          poster={thumbnailSrc}
                          controls
                          preload="metadata"
                          className="w-full h-48 object-cover rounded-t-lg"
                          loading="lazy">
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="w-full h-48 bg-gray-300 flex items-center justify-center rounded-t-lg text-gray-500">
                          No Video Available
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Status: {item.publish}</span>
                        <span>Views: Coming Soon</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else {
                 // NEW: Live rendering (placeholder + Watch button)
                return (
                  <Card key={item._id} className="w-full shadow-md hover:shadow-lg transition-shadow relative">
                    <CardHeader className="p-0">
                      <div className="w-full h-48 bg-black flex items-center justify-center rounded-t-lg relative">
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded font-bold">
                          LIVE {/* LIVE Badge */}
                        </div>
                        <span className="text-white text-lg">Live Stream</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {item.desc || 'Live now!'}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                        <span>Status: Live</span>
                        <span>Viewers: Coming Soon</span>
                      </div>
                      <button
                         onClick={() => watchLive(item._id)} // NEW: Watch live button
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                      >
                        Watch Live
                      </button>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        )}
        {/* NEW: Live Modal JSX (was missing entirely) */}
        {liveModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeLiveModal}>
            <div className="bg-white p-6 w-full max-w-2xl rounded-xl shadow-2xl relative max-h-[80vh] overflow-auto">
              <button
                onClick={closeLiveModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-red-500 text-center mb-4">Watching Live Stream</h2>
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted // Unmute if audio added
                  className="w-full h-96 border-2 border-red-500 rounded-lg bg-black"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded font-bold">
                  LIVE
                </div>
              </div>
                 <p className="text-gray-600 mb-4">Stream may take a few seconds to connect...</p>
              <button
                onClick={closeLiveModal}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Close Stream
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}