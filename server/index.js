import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { configDotenv } from "dotenv"
import { apiRoutes } from "./Routes/apiRoutes.js";
import multer from "multer";


configDotenv();



const app = express()
app.use(express.json())

 app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE, patch"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
 )


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

app.listen(PORT, ()=>{
    console.log("server is running")
    console.log(`local: http://localhost:${PORT}`)
 })
