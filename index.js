// require('dotenv').config({path:'./'})

import dotenv from "dotenv";
import connectDB from "./src/db/index.js";

dotenv.config({
    path: './env'
})

connectDB()
    .then((res) => {
        console.log("Database connected succefully !!!");

    })
    .catch((err) => {
        console.log(`Database connection is failed : ${err}`);
    })
































/*
import express from "express"

const app = express();

; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Unable to connect with database ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listing on port ${process.env.PORT}`);

        })
    } catch (error) {
        console.error("ERROR:", error)
        throw error;
    }
})()
*/