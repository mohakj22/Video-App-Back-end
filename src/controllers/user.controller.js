import { User } from "../models/user.models.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // Saving the refresh token in database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token."
        );
    }
};
// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// without using async handler
async function registerUser(req, res, next) {
    try {
        // Extract user details from request body
        const fullName = req.body.fullName;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const requiredFields = {
            fullName: fullName,
            email: email,
            username: username,
            password: password,
        };

        // Validate required fields
        for (let key in requiredFields) {
            if (!requiredFields[key]) {
                throw new ApiError(400, key + " is required");
            }
        }

        // Validate email format
        if (!isValidEmail(email)) {
            throw new ApiError(400, "Invalid email address");
        }

        // Check if email or username already exists
        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            throw new ApiError(409, "Email is already in use");
        }

        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
            throw new ApiError(409, "Username is already in use");
        }

        // Check for avatar and upload avatar image
        const avatarLocalPath =
            req.files &&
            req.files.avatar &&
            req.files.avatar[0] &&
            req.files.avatar[0].path;
        const avatar = avatarLocalPath
            ? await uploadOnCloudinary(avatarLocalPath)
            : null;

        // Optionally upload cover image
        const coverImageLocalPath =
            req.files &&
            req.files.coverImage &&
            req.files.coverImage[0] &&
            req.files.coverImage[0].path;
        const coverImage = coverImageLocalPath
            ? await uploadOnCloudinary(coverImageLocalPath)
            : null;

        // Create new user in the database
        const user = await User.create({
            fullName: fullName,
            avatar: avatar ? avatar.url : "",
            coverImage: coverImage ? coverImage.url : "",
            email: email,
            password: password,
            username: username.toLowerCase(),
        });

        const created = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if (!created) {
            throw new ApiError(
                500,
                "something went wrong while registering the user."
            );
        }

        // Return response (e.g., omit sensitive data)
        res.status(201).json(
            new ApiResponse(200, created, "User registered successfully")
        );
    } catch (error) {
        next(error);
    }
}

/*

// Register user controller
const registerUser = asyncHandler(async (req, res) => {
    // Extract user details from request body
    const { fullName, email, username, password } = req.body;
    const requiredFields = { fullName, email, username, password };

    // Validate required fields
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            throw new ApiError(400, `${key} is required`);
        }
    }

    // Validate email format
    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email address");
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new ApiError(409, "Email is already in use");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new ApiError(409, "Username is already in use");
    }

    // Check for avatar and upload avatar image
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required");
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // if (!avatar) {
    //     throw new ApiError(400, "Avatar upload failed");
    // }
    const avatar = avatarLocalPath
        ? await uploadOnCloudinary(avatarLocalPath)
        : null;

    // Optionally upload cover image
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    // Create new user in the database
    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    const created = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!created) {
        throw new ApiError(
            500,
            "something went wrong while regestring the user."
        );
    }

    // Return response (e.g., omit sensitive data)
    return res
        .status(201)
        .json(new ApiResponse(200, created, "User registered successfully"));
});

const findUser = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
});

*/

async function findUser(req, res, next) {
    try {
        // Extract username from request body
        console.log(req.body);
        const username = req.body.username;

        // Validate that username is provided
        if (!username) {
            throw new ApiError(400, "Username is required");
        }

        // Find user by username in the database
        const user = await User.findOne({
            username: username.toLowerCase(),
        }).select("-password -refreshToken");

        // If the user is not found, throw an error
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Return the found user data
        console.log(user);
        res.status(200).json(
            new ApiResponse(200, user, "User found successfully")
        );
    } catch (error) {
        next(error);
    }
}

async function loginUser(req, res, next) {
    try {
        // take username or email from the user
        // take password from the user
        // now find user from the database using input from the user
        // if user not found then throw error
        // then decrypt the password fetched from db
        // match this password with the input one
        // if matched then generate access token and refresh token and send them using cookies
        // else thron new APIerror

        const { email, username, password } = req.body;
        if (!username && !email) {
            throw new ApiError(400, "username or email is required");
        }
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw new ApiError(404, "Invalid username or email.");
        }
        let isCorrect = await user.isPasswordCorrect(password);
        if (!isCorrect) {
            throw new ApiError(401, "Invalid user credentials.");
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "User logged in successfully."
                )
            );
    } catch (error) {
        next(error);
    }
}
const logoutUser = async (req, res) => {
    try {
        // remove cookies
        // remove refresh token
        // and all set
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined,
            },
        });
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out."));
    } catch (error) {}
};
const refreshAccessToken = async () => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request.");
        }
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token.");
        }
        if (incomingRefreshToken !== user?.refreshAccessToken) {
            throw new ApiError(401, "Refresh token is expired or used.");
        }
        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully."
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
};

export { registerUser, findUser, loginUser, logoutUser, refreshAccessToken };
