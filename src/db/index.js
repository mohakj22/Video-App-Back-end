import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Mongo DB connected!! \n DB connection instance: ${connectionInstance}`);
        console.log(`\n Mongo DB connected!! \n DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongo DB connection error", error);
        process.exit(1);
    }
}

connectDB();

export default connectDB;
