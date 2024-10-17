import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`);
        console.log(`Server listing at http://localhost:${process.env.PORT}`);



    } catch (error) {
        console.log("MongoDB connection error :", error);
        process.exit(1)
    }
}

export default connectDB;