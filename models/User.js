const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema(
    {
        email: { type: String },
        phone_number: { type: String },
        user_name: { type: String, required: true },
        password: { type: String, required: true },
        nickname: { type: String, required: true },
        spending_limit_day: { type: String, require: true },
        spending_limit_month: { type: String, require: true },
        spending_limit_year: { type: String, require: true },
        image: { type: String }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", User);