import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const generateBothTokens = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    // console.log(accessToken)
    const refreshToken = user.generateRefreshToken();
    // console.log(refreshToken)

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})
    //validateBeforeSave checks if all the fields are present in the database object/document as per the model


    return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, fullName, email, password} = req.body;

    if (
        [username, fullName, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne ({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        if (existedUser.email === email) {
            throw new ApiError(409, "Email already registered")
        }
        else if (existedUser.username === username) {
            throw new ApiError(409, "Username not availabe")
        }
    }

    //const avatarLocalPath = req.file?.path;


    const user = await User.create({
            username: username.toLowerCase(), 
            fullName, email, password
    })

    //to check if user has been successfully created
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    // if ((!email) || (!password)){
    //     throw new ApiError(400, "Username or password cannot be empty")
    // }

    if (
        [email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne ({ email });
    //this user object has the (encrypted password)

    if(!user) {
        throw new ApiError(404, "Email not registered in our database")
    }

    const isValid = await user.isPassword(password)

    if (!isValid) {
        throw new ApiError(401, "Incorrect Password");
    }

    const {accessToken, refreshToken} = await generateBothTokens(user._id);
    //console.log("Both tokens", accessToken, refreshToken)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        }, 
        "User logged in successfully"
    ))
    
})


const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"))
})

const verifyUser = asyncHandler(async (req, res) => {

        //console.log("reached stage 2")
    
        try {
            const user = await User.findById(req.user?._id).select("-password -refreshToken")

            if (!user) {
                throw new ApiResponse(404, null, "User not found");
            }

            return res
            .status(200)
            .json(new ApiResponse(200, user, "User authenticated successfully"));
        } catch (error) {
            throw new ApiResponse(500, null, "Error while authenticating user", error);
        }
    }
)

const editUser = asyncHandler(async (req, res) => {
    const {username, email, fullName} = req.body;
    const { _id: userId } = req.user


    const user = await User.findByIdAndUpdate(userId, {
        username,
        email, 
        fullName
    })

    if (!user){
        throw new ApiError(404, "User not found, please try logging in again")
    }

    const updatedUser = await User.findById(userId).select("-password -refreshToken");
    if (!updatedUser) {
        throw new ApiError(404, "User not found, please try logging in again")
    }

    // 

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"))
}) 

const deleteUser = asyncHandler(async (req, res) => {
    console.log("reached backend")
    await User.findByIdAndDelete(req.user._id)
    .catch((err) => {
        new ApiError(500, "Something went wrong")
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"))
})









export {registerUser, loginUser, logoutUser, verifyUser, editUser, deleteUser}