import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    user: {
    type: Number,
    required: true,
    unique: true,
    },
    wallet: {
    type: String,
    },
    fee: {
        type: Number,
        default: 0.001,
    },
    buys: [{ type: Number }],
});

const User = mongoose.model("user", UserSchema);
export default User;
