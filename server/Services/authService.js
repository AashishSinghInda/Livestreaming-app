import jwt from "jsonwebtoken";

export const generateAccessToken = (user)=> {

      return jwt.sign(
        {userId : user._id.toString(), email : user.email},
        process.env.ACCESS_SECREAT_KEY,
        {expiresIn : "5m"}
     )
}


export const generateRefreshToken = (user)=>{
     return jwt.sign(
        {userId : user._id.toString(), email : user.email},
        process.env.REFRESH_SECRAT_KEY,
        {expiresIn : "7d"}
     )
}