 


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

/* app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)  */

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
    methods : ["GET", "POST"]
  }
})


app.use("/api", apiRoutes) 
app.use("/api", streamingRoutes) 

const PORT = process.env.PORT || 5000;

mongoose.connect(`mongodb://127.0.0.1:27017/livestreamapp`)
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
      console.log(`Stream started: ${liveId} by broadcaster ${socket.id}`);
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
    
    console.log(`Viewer ${socket.id} joined live ${liveId}`);
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
    console.log(`Answer sent to broadcaster for live ${liveId}`);
  });

  
  socket.on("ice-candidate", ({ candidate, liveId, viewerId }) => { 
    const broadcasterId = activeStreams.get(liveId);
    if (!broadcasterId || !candidate) return; 
    
    let targetId;
    if (socket.id === broadcasterId) {
     
      if (!viewerId) return; 
      targetId = viewerId;
    } else {
    
      targetId = broadcasterId;
    }
    
  
    io.to(targetId).emit("ice-candidate", { candidate, liveId });
    console.log(`ICE candidate sent for live ${liveId} to ${targetId}`);
  });

  
  socket.on("stop-live", async ({ liveId }) => {
    try {
      await stream.findByIdAndUpdate(liveId, { isLive: false, stoppedAt: new Date() });
      activeStreams.delete(liveId); 
      io.emit("live-stopped", { liveId }); 
      socket.leave(`room-${liveId}`);
      console.log(`Stream stopped: ${liveId}`);
    } catch (error) {
      console.error("Error stopping live:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

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

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 /* import express from "express"
    import cors from "cors"
    import mongoose from "mongoose"
    import { configDotenv } from "dotenv"
    import { apiRoutes } from "./Routes/apiRoutes.js";
    import path from "path";
    import { fileURLToPath } from "url";
    import http from "http";
    import { Server } from "socket.io";
    import stream from "./Model/stream.js";
  


    configDotenv();



    const app = express()
    app.use(express.json())

    app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,               
        methods: ["GET", "POST", "PUT", "DELETE, PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
    )


    const server = http.createServer(app)
    const io = new Server(server,{
        cors : {origin : "http://localhost:3000", methods : ["GET,POST"]}
    })

    
   const activeStreams = new Map();

    io.on("connection", Socket =>{
        console.log("socket connected:",Socket.id)

        Socket.on("broadcaster",()=>{
            broadcasterSocketId = Socket.id;
            console.log("Broadcaster registered:", broadcasterSocketId);
            Socket.broadcast.emit("broadcaster")
        })


        Socket.on("startStream", async ({title})=>{
            try{
                const rec = new stream({title, broadcasterSocketId: Socket.id, isLive: true, startedAt : new Date()});
                await rec.save()
                Socket.emit("streamStarted", rec);
                console.log("Stream started:", rec._id);
            }
            catch(error){
                console.log("Error create",err)
            }
        })

        Socket.on("stopStream", async ({streamId})=>{
            try{
                await stream.findByIdAndUpdate(streamId, {isLive : false, stoppedAt : new Date()});
                Socket.emit("streamStopped", {streamId});
                console.log("stream Stopped", streamId)
            }
            catch(err){
                console.log(err)
            }
        })

        Socket.on("watcher",()=>{
            if(broadcasterSocketId){
                io.to(broadcasterSocketId).emit("watcher", Socket.id)
            }
            else{
                Socket.emit("no-broadcaster")
            }
        })

        Socket.on("offer", (watcherId, description)=>{
            io.to(watcherId).emit("offer", Socket.id, description)
        })

        Socket.on("answer", (broadcasterId, description)=>{
            io.to(broadcasterId).emit("answer", Socket.id, description)
        })

        Socket.on("candidate",(peerId, candidate)=>{
            io.to(peerId).emit("candidate",Socket.id, candidate)
        })

        Socket.on("disconnect",()=>{
            console.log("Socket disconnected", Socket.id);

            if(Socket.id == broadcasterSocketId){
                broadcasterSocketId = null;
                Socket.broadcast.emit("broadcaster-offine")
            }
        })
    })




    app.get("/",(req,res)=>{
        res.send("server running successfully!")
    })

    app.use("/api",apiRoutes)  // http://localhost:5000/api

    const PORT = process.env.PORT || 5000;


    mongoose.connect(`mongodb://127.0.0.1:27017/livestreamapp`)
    .then((res)=>{
        console.log("DB Connected Sucessfully")
    })
    .catch((error)=>{
        console.log("DB connected error",error)
    })

    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    const dirname1 = path.dirname(filename);

    app.use("/upload/thum", express.static(path.join(dirname, "upload/thum")));
    app.use("/upload/video",express.static(path.join(dirname1, "upload/video")));



    server.listen(PORT, ()=>{
        console.log("server is running")
        console.log(`local: http://localhost:${PORT}`)
    })  */
