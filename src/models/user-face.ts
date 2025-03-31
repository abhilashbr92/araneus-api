const mongoose = require("mongoose");

export const UserFaceSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.ObjectId, ref: "User" },        // User Id
    Embeddings: mongoose.Schema.Types.Mixed
});

const UserFace = mongoose.model("UserFace", UserFaceSchema, "UserFace");
export { UserFace };
