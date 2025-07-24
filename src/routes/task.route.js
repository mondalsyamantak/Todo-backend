import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask } from "../controllers/task.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()

//secured routes for modifying tasks
router.route("/create").post(verifyJWT, upload.none(), createTask)


export default router
