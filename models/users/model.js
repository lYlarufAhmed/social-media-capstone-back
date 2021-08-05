const mg = require('mongoose')

// define schema
const userSchema = new mg.Schema({
    "username": {
        type: String,
        unique: true,
        required: true,
        index: true,
        min: 6
    },
    "email": {
        type: String,
        unique: true,
        required: true,
        match: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
        index: true
    },
    "password": {
        type: String,
        required: true
    },
    "refreshToken": {
        type: String,
    },
    "profileImage": {
        type: String,
    },
    "fullName": String,
    "posts": [
        {
            type: mg.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    "followers": [{
        type: String,
    }],
    "followings": [{
        type: String,
    }],
    "isFollowing": Boolean
}, {timestamps: true})

const User = mg.model('User', userSchema)

module.exports = User