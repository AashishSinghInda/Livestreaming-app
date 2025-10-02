import express from "express"
import { login, logout, refreshTokenController, Register } from "../Controllers/authControllers.js"

let authenticationRoutes = express.Router()


authenticationRoutes.post('/register',Register)
authenticationRoutes.post("/login",login)
authenticationRoutes.post("/refresh-token",refreshTokenController)
authenticationRoutes.post("/logout",logout)

export {authenticationRoutes}