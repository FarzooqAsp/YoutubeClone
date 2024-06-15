import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from "../utils/ApiErrors.js"
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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
    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    },)

    if(existedUser){
        throw new apiError(409, "User already existed")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"avatar local path is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const image = await uploadOnCloudinary(coverimageLocalPath)

    if(!avatar){
        throw new apiError(409, "avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const userCreated = User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!userCreated){
        throw new apiError(500, "something went wrong!")
    }
    res.status(201).json(
        new ApiResponse("User Register Successfully",userCreated,200)
    )



})
export {registerUser}