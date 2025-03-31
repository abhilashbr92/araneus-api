const mongoose = require("mongoose");

export const UserSchema = new mongoose.Schema({
    FName: { type: String },
    LName: { type: String },
    UName: { type: String },
    Pwd: { type: String, select: false },
    Admin: { type: Boolean }
});

const User = mongoose.model("Users", UserSchema, "Users");
export { User };
