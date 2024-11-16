const mongoose = require('mongoose');
const post = require('./post');
mongoose.connect('mongodb://127.0.0.1:27017/mern_crud');

const userschema = mongoose.Schema({
    Username : String,
    Name : String,
    Email : String,
    Password : String,
    Age : Number,
    ProfilePic : String,
    posts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'post',
    }]
});

module.exports = mongoose.model('user',userschema);