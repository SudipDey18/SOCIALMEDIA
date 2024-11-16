const mongoose = require("mongoose");
const user = require('./user');

mongoose.connect ('mongodb://127.0.0.1:27017/mern_crud');

const postschema = mongoose.Schema({
    PostTitle : String,
    PostPicture : String,
    UserId : {
        type : mongoose.Schema.ObjectId,
        ref : "user"
    },
    Date: {
        type: Date,
        default: Date.now
    },
    LikedUsers:[{
        type : mongoose.Schema.ObjectId,
        ref : "user"
    }],
    // Comments:[{
    //     type : mongoose.Schema.ObjectId,
    //     ref : "user"
    // }]
});

module.exports = mongoose.model('post',postschema);