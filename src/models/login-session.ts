const mongoose = require("mongoose");

export const LoginSessionSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.ObjectId, ref: "User" },        // User Id
    In: { type: Date },                                             // Login DateTime
    Out: { type: Date },                                            // Logout DateTime
    AccessToken: { type: String, trim: true },                      // Access Token
});

const LoginSession = mongoose.model("LoginSessions", LoginSessionSchema, "LoginSessions");
export { LoginSession };
