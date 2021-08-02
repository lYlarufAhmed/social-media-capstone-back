const mg = require('mongoose')

// define schema
const postSchema = new mg.Schema({
    "content": {type: String, required: true}
    ,
    "meta": {
        "like": Number,
        "dislike": Number,
    }
}, {timestamps: true})



const Post = mg.model('Post', postSchema)

module.exports = Post