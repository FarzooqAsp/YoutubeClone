import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from "../utils/ApiErrors.js"
import { User } from "../models/user.models.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userid) => {
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave:false })
        return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(500, "somethind went wrong while generatind access and refresh token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    // algo to register user

    // get user details from frontend
    // validation =>check for not empty
    // check if user already exists via username or email
    // check for avatar and for image
    // upload them to cloudinary
    // create entry in db 
    // remove password refreshtoken fields from response
    // check for user creation
    //return response

    const {username,email,fullName,password} = req.body
    // console.log("fullName", fullname);
    if
    ([username,email,fullName,password].some((field)=>
        field?.trim() === "")
    )
    {
        throw new apiError(400, "All Fields Are Required")
    }
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        throw new apiError(409, "User already existed")
    }
    // const avatarLocalPath = req.files?.video[0]?.path;
    const coverimageLocalPath = req.files?.coverImage[0]?.path.replace(/\\/g, '/');
    console.log(req.files);

    // console.log(`avatar local path is ${avatarLocalPath}`);
    // if(!avatarLocalPath){
    //     throw new apiError(400,"avatar local path is required")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(`avatar path os ${avatar}`);
    const image = await uploadOnCloudinary(coverimageLocalPath)
    // if(!avatar){
    //     throw new apiError(409, "Avatar file upload failed")
    // }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        // avatar: avatar.url,
        coverImage: image?.secure_url || ""
    })

    const userCreated = User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!userCreated){
        throw new apiError(500, "something went wrong!")
    }
    return res.status(201).json(
        new ApiResponse(200,userCreated,"user created successfully")
    )
})

const loginUser = asyncHandler( async (req, res)=>{

    // req body -> data
    // username or email 
    // find the user 
    // check password
    // access and refresh token
    // send cookies 

    const {username,email,password} = req.body
    if(!(username || email)){
        throw new apiError(400, "username or email is required")
    }
    const user = await User.findOne({$or: [{username},{email}]})
    if(!user){
        throw new apiError(404, "user dose not find")
    }
    const ispasswordValidate = await user.ispasswordcorrect(password)

    if(!ispasswordValidate){
        throw new apiError(401, "invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const options = {
        httpOnly : true,
        secure : true
    }

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(
            201,
            {
                user: loggedinUser, accessToken, refreshToken
            },
            "user loggedIn successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(201,{},"user logged out"))
})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incommingRefreshToken){
        throw new apiError(401,"unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        if(!decodedToken){
            throw new apiError(401, "invalid token passed")
        }
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new apiError(401, "invalid refresh token")
        }
        if(incommingRefreshToken !== user?.refreshToken){
            throw new apiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "access token refreshed"
            )
        )

    } catch (error) {
        throw new apiError(401, error?.message || "invalid refresh token")
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }