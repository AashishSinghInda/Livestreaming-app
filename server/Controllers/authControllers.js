import user from "../Model/user.js"
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../Services/authService.js"
import jwt from "jsonwebtoken";





export const Register = async (req,res)=>{
    
    let {name, email, password , confirmPassword} = req.body

    try{
        if(!name || !email || !password || !confirmPassword){
            res.status(400).json({message : "All field are required! "})
        }

        if(password !== confirmPassword){
            res.status(400).json({message : "password don't match! "})
        }

        let existingemail = await user.findOne({email})
    
        if(existingemail){
            res.status(400).json({message : "email name already Registered! "})
        }

        const  hashPassword = await  bcrypt.hash(password,10)

        const newUser = await user.create({
            name,
            email,
            password : hashPassword,
            
        })

        res.status(200).json({
            message : "user Registerd sucessfully !",
             userFilled : {
                userId : newUser._id.toString(),
                name : newUser.name,
                email : newUser.email,
              },
        })

       
    }
     catch(error){
            res.status(500).json({message : "server error", error : error.message})
        }
}







export const login = async (req,res)=>{

 let {email , password} = req.body

    try{
        
        
        if(!email || !password){
           return res.status(400).json({message : "all filed are required! "})
        }

       const checkEmail = await user.findOne({email})

        if(!checkEmail){
           return res.status(400).json({message : " User not found "})
        }
        
       const isMatch = await bcrypt.compare(password, checkEmail.password)

       if(!isMatch){
            
            return res.status(400).json({message : "password don't match! "})
        }

        const accessToken = generateAccessToken(checkEmail)
        const refreshToken = generateRefreshToken(checkEmail)

        checkEmail.accessToken = accessToken
        checkEmail.refreshToken = refreshToken

        await checkEmail.save()

   
       return res.status(200).json({
            message : "User Login Sucessfully!",
            userFilled : {
                userId : checkEmail.id.toString(),
                email : checkEmail.email,
                password : checkEmail.password,
            },
            accessToken,
            refreshToken,
        })
    }
        catch(error){
        res.status(500).json({ message : "server arror"}, error.essage)
    }
}    



export const refreshTokenController = async (req,res)=>{
    try {
        const {refreshToken} = req.body

        if(!refreshToken){
            res.status(400).json({message : "refresh token required!"})
        }
    
        let decoded;

       try{
            decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRAT_KEY)
       }
       catch(err){
        return res.status(403).json({message : "Refresh token expire, please login again"})
       }

       const usercheck = await user.findById(decoded.userId);
       if(!usercheck || usercheck.refreshToken !== refreshToken){
        return res.status(403).json({message : "Invalid refresh token"})
       }

       const newAccessToken = generateAccessToken(usercheck);

        usercheck.accessToken = newAccessToken;
        await usercheck.save();

         res.status(200).json({
        message: "New access token generated successfully",
        accessToken: newAccessToken,
        refreshToken: refreshToken, 
    });
    }
    catch(error){
        res.status(500).json({message : "server error", error : error.message})
    }

   
}


export const logout = async (req,res)=>{
    try{
       let {userId}    =   req.body


       if(!userId){
       return res.status(400).json({message : "user information required!..."})

       }

    let finduser = await user.findByIdAndUpdate(userId,{
       accessToken : null,
       refreshToken : null,
    })

       res.status(200).json({message: "user logout sucessfully!...",})
    }
    catch(error){
        res.status(500).json({message: "server errror!...."})
    }

    
    
    

}