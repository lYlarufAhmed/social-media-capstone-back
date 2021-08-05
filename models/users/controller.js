const User = require('./model')
const bc = require('bcrypt')
const Post = require("../posts/model");


const logInUser = async ({username, password}) => {
    let user = await User.findOne({username: username})
    console.log(user)
    // if (!!!user) return false
    if (!!user && await bc.compare(password, user.password)) return {userId: user._id, username: user.username}
    return false
}

const updateRefreshToken = async (username, refreshToken) => {
    await User.findOneAndUpdate({username}, {refreshToken})
}

const logOutUser = async (userId) => {
    await User.findByIdAndUpdate(userId, {refreshToken: ''})
}

const createNewUser = async ({email, password, username, fullName, avatar}) => {
    // hash the password with bycrypt
    let status = {}
    try {
        let hashPass = await bc.hash(password, 12)
        let newObj = {email, password: hashPass, username}
        if (avatar) newObj.profileImage = avatar
        if (fullName) newObj.fullName = fullName
        console.log(newObj)
        let buffer = new User(newObj)
        await buffer.save()
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


const searchUser = async (query = {}) => {
    let status = {}
    try {
        let users = await User.find(query)
        status.success = true
        status.result = users
    } catch (e) {
        status.success = false
    }
    return status
}

const follow = async (followerUsername, followedUsername) => {
    let status = {}
    console.log(followerUsername, followedUsername)
    try {
        await User.findOneAndUpdate({username: followerUsername}, {$addToSet: {followings: followedUsername}})
        await User.findOneAndUpdate({username: followedUsername}, {$addToSet: {followers: followerUsername}})
        status.success = true
    } catch (e) {
        console.log(e.message)
        status.success = false
        status.message = e.message
    }
    return status

}
const unfollow = async (followerUsername, followedUsername) => {
    let status = {}
    try {
        await User.findOneAndUpdate({username: followerUsername}, {$pull: {followings: followedUsername}})
        await User.findOneAndUpdate({username: followedUsername}, {$pull: {followers: followerUsername}})
        status.success = true
    } catch (e) {
        console.log(e.message)
        status.success = false
        status.message = e.message
    }
    return status

}

const getFeed = async (userId) => {
    let result = await User.findById(userId)
    // console.log(userId)
    let status = {}
    if (result) {
        try {
            let loggedFollowings = await User.find({username: {$in: result.followings.concat(result.followers)}})
            // console.log(loggedFollowings)
            let followingsIds = loggedFollowings.map(f => f._id)
            followingsIds.push(userId)
            let feeds = await Post.find({author: {$in: followingsIds}}).limit(20).sort({createdAt: -1}).populate('author')
            // console.log(feeds)
            // feeds = feeds.map(feeds=>{})
            return {success: true, result: feeds}
        } catch (e) {
            console.log(e)
            status.success = false
            status.message = e.message
        }

    }
    status.success = false
    return status
}

module.exports = {
    logInUser, createNewUser, searchUser, updateRefreshToken, logOutUser, follow, unfollow, getFeed
}