import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({ path: "./env" });
connectDB()
    // If db is connected  then start listening on the port else go in the catch part and throw error
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR : ", error);
            throw error;
        });
        app.listen(process.env.PORT || 8000, () => {
            console.log("Server is running at : ", process.env.PORT);
        });
    })
    .catch((error) => {
        console.log("Database connection failed!", error);
    });

/*
import express from "express";
const app = express();
; (async () => { 
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on ${process.env.PORT}`);
        })
    }
    catch (error) {
        console.log("ERROR: ", error);
        throw error;
    }
})()
*/
