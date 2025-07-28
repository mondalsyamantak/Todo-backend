import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

dotenv.config({
    path: "./.env",
});


//listening to the server


connectDB()
.then( () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on  http://localhost:${port}`);
    })
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
});


