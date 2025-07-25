import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const router = Router();

router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/auth").get(verifyJWT, (req, res) => {

    try {
        const user = User.findById(req.user?._id).select("-password -refreshToken")
        return res
        .status(200)
        .json(new ApiResponse(200, user, "User authenticated successfully"));
    } catch (error) {
        throw new ApiResponse(500, null, "Error while authenticating user", error);
    }
})


export default router