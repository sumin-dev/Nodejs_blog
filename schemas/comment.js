const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
        postId: {
            type: String,
            required: true,
        },
        user: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        createdAt: {
            type: String,
        },

});

module.exports = mongoose.model("Comments", commentsSchema);