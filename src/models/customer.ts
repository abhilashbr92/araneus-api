const mongoose = require("mongoose");

export const CustomerSchema = new mongoose.Schema({
    Name: { type: String },
    Phone: { type: Number }
});

const Customer = mongoose.model("Customers", CustomerSchema, "Customers");
export { Customer };
