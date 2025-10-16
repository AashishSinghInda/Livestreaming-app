 


 import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { configDotenv } from "dotenv"
import { apiRoutes } from "./Routes/apiRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import stream from "./Model/stream.js"; 
import { streamingRoutes } from "./Routes/streamingRoutes.js";

configDotenv();

const app = express()
app.use(express.json())



 app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || origin === 'http://localhost:3000' || origin.startsWith('http://192.168.')) {
        callback(null, true);  
      } else {
        callback(new Error('Not allowed by CORS'));  
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); 



const server = http.createServer(app)
const io = new Server(server, {
  cors : {
    origin : function(origin, callback){
      if(!origin || origin == 'http://localhost:3000' ||  origin.startsWith('http://192.168.')){
        callback(null, true);
      }
      else{
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods : ["GET", "POST"],
  },
})


app.use("/api", apiRoutes) 
app.use("/api", streamingRoutes) 

const PORT = process.env.PORT || 5000;

 // mongoose.connect(process.env.MONGODBURL)
mongoose.connect(`mongodb://localhost:27017/${process.env.LOCALMONGODBNAME}`)
  .then(() => console.log("DB Connected Successfully"))
  .catch((error) => console.log("DB connection error", error))

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use("/upload/thum", express.static(path.join(dirname, "upload/thum")));
app.use("/upload/video", express.static(path.join(dirname, "upload/video")));

app.get("/", (req, res) => {
  res.send("server running successfully!")
})

const activeStreams = new Map(); 

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  
  socket.on("start-live", async ({ title, desc }) => {
    try {
      const newStream = new stream({
        title,
        desc: desc || '',
        broadcasterSocketId: socket.id, 
        isLive: true,
        startedAt: new Date(),
      });
      await newStream.save();

      const liveId = newStream._id;
      activeStreams.set(liveId.toString(), socket.id); 
      socket.join(`room-${liveId}`); 

 
      io.emit("live-started", { liveId: liveId.toString(), title, desc });
      console.log(`Stream started: ${liveId} by broadcaster ${socket.id}>>>>>>>>>>>>>>>>>>10`);
    } catch (error) {
      console.error("Error starting live:", error); 
      socket.emit("error", { message: "Failed to start live" });
    }
  });

 
  socket.on("join-live", ({ liveId }) => {
    const broadcasterId = activeStreams.get(liveId);
    if (!broadcasterId) {
      socket.emit("no-broadcaster", { liveId });
      return;   
    }
    socket.join(`room-${liveId}`); 
    
   
    io.to(broadcasterId).emit("viewer-joined", { viewerId: socket.id, liveId });
    
    
    socket.emit("broadcaster-ready", { broadcasterId, liveId });
    
    console.log(`Viewer ${socket.id} joined live ${liveId}>>>>>>>>>>>>>>>>>>>>>>11`);
  });

  
  socket.on("offer", ({ offer, viewerId, liveId }) => {
    
    io.to(viewerId).emit("offer", { offer, liveId });
    console.log(`Offer sent to viewer ${viewerId} for live ${liveId}`);
  });


  socket.on("answer", ({ answer, liveId }) => {
    const broadcasterId = activeStreams.get(liveId);
    if (broadcasterId) {
    
      io.to(broadcasterId).emit("answer", { answer, viewerId: socket.id, liveId });
    }
    console.log(`Answer sent to broadcaster for live ${liveId}>>>>>>>>>>>>>>>>>>>>>>>>12`);
  });

  



socket.on("ice-candidate", ({ candidate, liveId, viewerId }) => {
  if (!candidate || !liveId) return;

  const broadcasterId = activeStreams.get(liveId);
  if (!broadcasterId) {
    console.warn('Server: no broadcaster found for liveId', liveId);
    return;
  }

  // If the sender is the broadcaster, the candidate should be forwarded to the viewerId provided.
  if (socket.id === broadcasterId) {
    if (!viewerId) {
      console.warn('Server: broadcaster sent ice-candidate without viewerId for live', liveId);
      return;
    }
    io.to(viewerId).emit('ice-candidate', { candidate, liveId });
    console.log(`Server: forwarded ICE candidate from broadcaster to viewer ${viewerId} for live ${liveId}`);
    return;
  }

  // Otherwise sender is a viewer - forward candidate to broadcaster
  io.to(broadcasterId).emit('ice-candidate', { candidate, liveId, viewerId: socket.id });
  console.log(`Server: forwarded ICE candidate from viewer ${socket.id} to broadcaster ${broadcasterId} for live ${liveId}`);
});












  
  socket.on("stop-live", async ({ liveId }) => {
    try {
      await stream.findByIdAndUpdate(liveId, { isLive: false, stoppedAt: new Date() });
      activeStreams.delete(liveId); 
      io.emit("live-stopped", { liveId }); 
      socket.leave(`room-${liveId}`);
      console.log(`Stream stopped: ${liveId}>>>>>>>>>>>>>>>>>>>>>>>>>>>15`);
    } catch (error) {
      console.error("Error stopping live:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:>>>>>>>>>>>>>>>>>>16", socket.id);

    for (let [liveId, broadcasterId] of activeStreams.entries()) {
      if (broadcasterId === socket.id) {
        io.emit("live-stopped", { liveId });
        activeStreams.delete(liveId);
        
        stream.updateMany({ broadcasterSocketId: socket.id }, { isLive: false, stoppedAt: new Date() });
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log("Server is running");
  console.log(`Local: http://localhost:${PORT}`);
})

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

