const Post = require('./model')
const User = require("../users/model");


const createNewPost = async ({content, authorID, meta}) => {
    // hash the password with bycrypt
    let status = {}
    try {
        let buffer = new Post({content, meta})
        await buffer.save()
        await User.findByIdAndUpdate(authorID, {$push: {"posts": buffer._id}})
        status.success = true
        console.log(buffer)
    } catch (e) {
        console.log(e.message)
        status.message = 'Server Error!'
        status.success = false
    }
    return status
    // set the image path
    // create the object
}


const searchPost = async (query = {}) => {
    let status = {}
    try {
        let posts = await Post.find(query)
        status.success = true
        status.result = posts
    } catch (e) {
        status.success = false
    }
    return status
}

async function deletePost(postID, authorID) {
    let status = {}
    try {
        let changes = await User.findByIdAndUpdate(authorID, {$pull: {"posts": postID}})
        console.log(changes)
        await Post.deleteOne({_id: postID})
        status.success = true
    } catch (e) {
        status.success = false
        status.message = e.message
    }
    return status
}

module.exports = {
    createNewPost, searchPost, deletePost
}