const Post = require('./model')
const User = require("../users/model");


const createNewPost = async ({content, authorID}) => {
    // hash the password with bycrypt
    let status = {}
    try {
        let buffer = new Post({content, author: authorID})
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
        let posts = await Post.find(query).populate('author')
        status.success = true
        status.result = posts
    } catch (e) {
        status.success = false
    }
    return status
}

async function likePost(postId,userId) {
    let status = {}
    try {
        await Post.updateMany({_id: postId}, {$push: {like: userId}})
        status.success = true
    } catch (e) {
        console.log(e.message)
        status.success = false
    }
    return status
}

async function dislikePost(postId, userId) {
    let status = {}
    try {
        await Post.updateMany({_id: postId}, {$pull: {like: userId}})
        status.success = true
    } catch (e) {
        console.log(e.message)
        status.success = false
    }
    return status
}

async function deletePost(postId, authorID) {
    let status = {}
    try {
        let changes = await User.findByIdAndUpdate(authorID, {$pull: {"posts": postId}})
        console.log(changes)
        await Post.deleteOne({_id: postId})
        status.success = true
    } catch (e) {
        status.success = false
        status.message = e.message
    }
    return status
}

module.exports = {
    createNewPost, searchPost, deletePost, likePost, dislikePost
}