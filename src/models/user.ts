import { time } from "console";

const mongoose = require("mongoose");

export const UserSchema = new mongoose.Schema({
    FName: { type: String },
    LName: { type: String },
    UName: { type: String },
    Pwd: { type: String, select: false },
    Admin: { type: Boolean, default: false },
    FaceReg: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("Users", UserSchema, "Users");
export { User };
