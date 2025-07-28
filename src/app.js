import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

//creating app and using middlewares
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
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


//to send the errors to the data object
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});


export {app}