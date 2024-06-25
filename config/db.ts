import mongoose from "mongoose";

import config from ".";

const connectDB = async () => {
    try {
    console.log("Connecting server! ", config.MONGO_URI);
    const db = await mongoose.connect(config.MONGO_URI);

    console.log("DB Connected Successfully");

    return db;
    } catch (err) {
        console.log(err);
    }
};

export default connectDB;
