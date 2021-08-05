const mg = require('mongoose')

// define schema
const postSchema = new mg.Schema({
    "content": {type: String, required: true}
    ,
    'author': {type: mg.SchemaTypes.ObjectId, ref: 'User'},
    "like": [{type: mg.SchemaTypes.ObjectId, ref: 'User'}],
    "liked": Boolean
}, {timestamps: true})


const Post = mg.model('Post', postSchema)

module.exports = Post