import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//creating app and using middlewares
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({
    limit: "50mb"  

}));
app.use(express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));
app.use(express.static("public"));
app.use(cookieParser());

// Importing routes
import taskRoutes from "./routes/task.route.js";
import userRoutes from "./routes/user.route.js";




//routes declaration:
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes)





export {app}