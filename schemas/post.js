const mongoose = require("mongoose");

const postsSchema = mongoose.Schema({
        user: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        createdAt: {
            type: String,
        },

});

module.exports = mongoose.model("Posts", postsSchema);