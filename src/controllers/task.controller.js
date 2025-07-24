import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";


const getTasks = asyncHandler(async (req, res) => {
    const user = User.findById(req.user._id).populate("todoList");
    const tasks = await user.todoList;

    return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
})

const createTask = asyncHandler(async (req, res) => {
    const {title = "", description, dueDate} = req.body;
    const user = await User.findById(req.user._id);

    if (title === "") {
        throw new ApiError(400, "Title cannot be empty");
    }

    const existedTask = await Task.findOne({title})
    if(existedTask) {
        throw new ApiError(409, "Task with same title already exists")
    }

    //console.log("user id: ", user._id)
    
    const task = await Task.create({
        title,
        description,
        dueDate,
        userId: user._id
    }) 


    //checking if the process was successful
    const createdTask = await Task.findById(task._id)
    if (!createdTask) {
        throw new ApiError(500, "Task creation failed, try again")
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $push: {
                todoList: createdTask._id
            }
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, createTask, "Task created successfully"))
})

const updateTask = asyncHandler(async (req, res) => {

    const {id} = req.params;
    const {title, description, dueDate, completed} = req.body;


    const task = await Task.findByIdAndUpdate(id, {
        title, description, dueDate, completed
    } )

    if (!task){
        throw new ApiError(404, "Task not found")
    }

    return res
    .status(200)
    .json(200, {}, "Task updated successfully")


})

export {createTask}