import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser, verifyUser, editUser, deleteUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const router = Router();

router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/auth").get(verifyJWT, verifyUser )
router.route("/edit-user").post(verifyJWT, editUser)
router.route("/delete-user").post(verifyJWT, deleteUser)


export default router