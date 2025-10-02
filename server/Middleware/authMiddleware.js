import jwt from "jsonwebtoken";

export const verifyAccessToken = (req,res,next)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({message : "Access token missing"})
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY,(err,decoded) =>{
        if(err){
            if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired" });
        }
            return res.status(403).json({ message: "Invalid access token" });
        }

        req.token =  token;
        req.usercheck = decoded;
        next();
    })
    
}