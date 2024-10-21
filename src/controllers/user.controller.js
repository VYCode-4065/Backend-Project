import { ApiError } from "../utils/ApiErrors.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res 


    // destructuring req.body values
    const { fullName, email, username, password } = req.body;

    // check that any field is not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if entered user is already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    // if user is already exists throw error and stop further processing
    if (existedUser) {
        throw new ApiError(409, "username or email is already exists !")
    }

    // accessing path of avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files.coverImage && req.files.coverImage > 0) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

    // check if avatar image path does not exit throw an error
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ");
    }


    // uploading avatar and cover image on cloudinary 
    let avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // check if avatar does'nt uploaded on cloudinary throw error
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // entering values of user in database 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })


    // removing password and refreshtoken values from createdUser 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // sending response to client 
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully !")
    )
})

export { registerUser };