import jwt from "jsonwebtoken";
import { apiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler( async (req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apiError(401, "unauthorized request")
        }
        const decodetoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decodetoken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError(401, "invalid access token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, "invalid access token")
    }
})