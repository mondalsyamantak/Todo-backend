//this middleware checks if the user is there or not
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt, { decode } from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js";

//this should be used before any kind of task like adding tasks etc
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken
    
        if (!accessToken) {
            throw new ApiError(401, "Unauthorised request")
        }
        
    
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET) //decoding the payload using accesstoken
        //console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        //console.log(user)
    
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user; //forwarding the user to the next middleware
        //console.log("User",user._id)
        next(); //executing next
    } catch (error) {
        throw new ApiError(469, "Unauthorised access blocked: ", error)
    }

}) 

export {verifyJWT}