import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () =>{
     try {
        const MONGO_URI = process.env.MONGO_URI || " ";
        const connect = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`Mongodb connected ${connect.connection.host}`)
     } catch (error) {
        console.log(`Error: ${error.message}`)
     }
}

