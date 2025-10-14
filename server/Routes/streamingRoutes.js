import express from "express"
import { liststream,  streams, streamsId } from "../Controllers/streamControllers.js"


let streamingRoutes = express.Router()


// streamingRoutes.post('/create-stream',createsreaming) 
 streamingRoutes.get('/streams',liststream)
 streamingRoutes.post('/streams',streams)
 streamingRoutes.post('/streams/:id/stop', streamsId)

export {streamingRoutes}