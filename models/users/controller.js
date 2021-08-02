const User = require('./model')
const bc = require('bcrypt')


const logInUser = async ({username, password}) => {
    let user = await User.findOne({username: username})
    console.log(user)
    // if (!!!user) return false
    if (!!user && await bc.compare(password, user.password)) return user._id
    return false
}

const updateRefreshToken = async (username, refreshToken) => {
    await User.updateOne({username}, {refreshToken})
}

const logOutUser = async ({refreshToken}) => {
    await User.updateOne({refreshToken}, {refreshToken: ''})
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

module.exports = {
    logInUser, createNewUser, searchUser, updateRefreshToken, logOutUser
}