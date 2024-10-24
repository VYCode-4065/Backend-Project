import { ApiError } from "../utils/ApiErrors.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };


    } catch (error) {
        throw new ApiError(500, "Something went wrong when generating access token")
    }
}
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

const loginUser = asynchandler(async (req, res) => {

    // req.body -> data
    // username or password
    // check user exists or not
    // password check 
    // access token and refresh token
    // send response via cookie(secure)

    const { username, password, email } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "username or password are required ");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    const validPassword = await user.isPasswordCorrect(password);

    if (!validPassword) {
        throw new ApiError('402', "invalid user credential");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully ")
        )

    res.ApiResponse()
})

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        }
    },
        {
            new: true,
        })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
        status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
})

export {
    registerUser,
    loginUser,
    logoutUser
};