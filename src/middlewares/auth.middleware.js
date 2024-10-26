import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asynchandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")

        // Todo discuss about frontend
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }


        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})