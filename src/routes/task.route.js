import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()

//secured routes for modifying tasks
//verifyJWT uses cookies to verify and get info of the user
router.route("/create").post( createTask, getTasks)
router.route("/all-tasks").post(getTasks);
router.route("/delete").post(deleteTask, getTasks)
router.route("/edit-task").post(updateTask, getTasks)


export default router
