import express from "express"
import { authenticationRoutes } from "./authenticationRoutes.js"
import { videoRoutes } from "./videoRoutes.js"
import { streamingRoutes } from "./streamingRoutes.js"


let apiRoutes = express.Router()

apiRoutes.use("/auth",authenticationRoutes)  //http://localhost:5000/api/auth
apiRoutes.use("/uploads",videoRoutes)
apiRoutes.use("/streaming",streamingRoutes)

export {apiRoutes}