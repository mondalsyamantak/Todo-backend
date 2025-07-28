import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";


const getTasks = asyncHandler(async (req, res) => {
    //console.log("reached stage 2 with user:", req.user)
    try {

        const today = new Date();
        //console.log(today.getDate(), today.getMonth(), today.getFullYear(), "is today's date")
        
        const {location, userId} = req.body
        //console.log("backend: ",location)

        const user = await User.findById(userId).populate("todoList");
        let tasks;

        if (location.trim() === "/") {
            tasks = user.todoList;
        }
        
        if (location.trim() === "/today") {

            tasks = user.todoList.filter( task => {
                const dueDate = new Date(task.dueDate);
                //console.log(dueDate.getDate(), dueDate.getMonth(), dueDate.getFullYear(), "is the due date of the task")

                const bool = (
                    (dueDate.getDate() === today.getDate()) && 
                    (dueDate.getMonth() === today.getMonth()) && 
                    (dueDate.getFullYear() === today.getFullYear())
                )
                //console.log(bool, "is the bool value for today")
                return bool
            })

            // if (!tasks) {
            //     tasks = {};
            // }
        }

        if (location.trim() === "/tomorrow") {

            tasks = user.todoList.filter( task => {
                const dueDate = new Date(task.dueDate);

                const bool = (
                    (dueDate.getDate() === today.getDate()+1) && 
                    (dueDate.getMonth() === today.getMonth()) && 
                    (dueDate.getFullYear() === today.getFullYear())
                )

                return bool
            })

            // if (!tasks) {
            //     tasks = {};
            // }
        }

        if (location.trim() === "/this-month") {

            tasks = user.todoList.filter( task => {
                const dueDate = new Date(task.dueDate);

                const bool = (

                    (dueDate.getMonth() === today.getMonth()) && 
                    (dueDate.getFullYear() === today.getFullYear())
                )

                return bool
            })

            // if (!tasks) {
            //     tasks = {};
            // }
        }
        
        return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"))

    } catch (error) {
        console.log("Error fetching tasks:", error);
        throw new ApiError(500, "Failed to fetch tasks");
    }
})

const createTask = asyncHandler(async (req, res, next) => {
    const {title = "", description, dueDate, priority, userId, location} = req.body;
    const user = await User.findById(userId);

    if (title === "") {
        throw new ApiError(400, "Title cannot be empty");
    }

    const existedTask = await Task.findOne({title})
    if (existedTask) {
        throw new ApiError(409, "Task with same title already exists")
    }

    //console.log("user id: ", user._id)
    
    const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
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

    req.body.location = location
    next()

    // return res
    // .status(200)
    // .json(new ApiResponse(200, createTask, "Task created successfully"))
})

const deleteTask = asyncHandler(async (req, res, next) => {
    try {

        // console.log(req.body)

        const {id, userId, location} = req.body || "empty";
        console.log("user: ", userId)
        console.log("task: ", id)
        // console.log(id, "is the id of the task to delete")

        const deletedTask = await Task.findByIdAndDelete(id);

        if(!deletedTask) {
            throw new ApiError(500, "Something went wrong")
        }
        
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: { 
                    todoList: id,
                }
            });
        
        req.body.location = location
        next()
        
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Some error occured")
    }

})

const updateTask = asyncHandler(async (req, res, next) => {
    console.log("reached1")
    const {id, title, description, dueDate, priority, userId, location} = req.body;
    console.log(priority, "is the priority")


    const task = await Task.findByIdAndUpdate(id, {
        title, description, dueDate, priority, 
    })

    if (!task){
        throw new ApiError(404, "Task not found")
    }

    

    const updatedTask  = await Task.findById(id)
    //console.log(updatedTask, "is the updated task")
    const user = await User.findById(userId).populate("todoList")
    const tasks = user.todoList;
    //console.log(tasks, "is the tasks after update")
    console.log("reached2")

    // return res
    // .status(200)
    // .json(new ApiResponse(200, tasks, "Task updated successfully"))

    req.body.location = location;

    console.log("going to next with body: \n", req.body)

    next();


})

const getTasksAlt = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("todoList");
    
    const demand = req.demand?.toLowerCase() || "all";
    const now = new Date();

    //the logic below is chatgpt generated
    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (!user.todoList) {
        throw new ApiError(404, "No tasks found for the user");
    }

    console.log("User's todoList:", user.todoList);

    // const tasks = user.todoList?.filter((task) => {
    //     const taskDate = new Date(task.dueDate);
    
    //     if (demand === "all") return true;
    
    //     if (demand === "today") {
    //       return isSameDay(taskDate, now);
    //     }
    
    //     if (demand === "tomorrow") {
    //       const tomorrow = new Date(now);
    //       tomorrow.setDate(now.getDate() + 1);
    //       return isSameDay(taskDate, tomorrow);
    //     }
    
    //     if (demand === "this week") {
    //       const start = new Date(now);
    //       const end = new Date(now);
    //       const day = now.getDay(); // 0 = Sunday
    //       start.setDate(now.getDate() - day);
    //       end.setDate(now.getDate() + (6 - day));
    //       start.setHours(0, 0, 0, 0);
    //       end.setHours(23, 59, 59, 999);
    //       return taskDate >= start && taskDate <= end;
    //     }
    
    //     return false; // unknown demand
    //   });

    //console.log("Filtered tasks:", tasks);
    const tasks = user.todoList;
    
    return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
})


export {createTask, getTasks, updateTask, getTasksAlt, deleteTask}