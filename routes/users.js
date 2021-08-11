const express = require('express')
const router = express.Router()

// for saving form file
const multer = require('multer')
// jwt
const jwt = require('jsonwebtoken')
const verifyRequestHeader = require("../middlewares");
const {searchPost} = require("../models/posts/controller");
const {unfollow} = require("../models/users/controller");

const {
    logInUser, searchUser, createNewUser,
    updateRefreshToken, logOutUser, follow
} = require('../models/users/controller')


// modified storage object to store them file storage
const storage = new multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/uploads/auth')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// new multer instant with customized storage config
const upload = multer({storage})
router.route('/profile/:username').get(async (req, res) => {
    let username = req.params.username
    if (username) {
        let status = await searchUser({username: username})
        if (status.result.length) {
            let userObj = status.result[0]
            userObj.password = ''
            userObj.refreshToken = ''
            userObj.isFollowing = userObj.followers.includes(req.username)
            let postsRes = await searchPost({_id: {$in: userObj.posts}})
            if (postsRes.success) {
                userObj.posts = postsRes.result.map(r => {
                    r.liked = r.like.includes(req.userId)
                    // console.log(r)
                    return r
                })
            }
            status.result = userObj
            console.log(status)
        }
        res.json(status)
    } else {
        res.sendStatus(404)
    }

})

router.route('/')
    .get(verifyRequestHeader, async (req, res) => {
        // console.log(req.userId)
        // let status = await searchUser({_id: req.userId})
        let status = await searchUser()
        res.json(status)
    })
    .patch(verifyRequestHeader, async (req, res) => {
        let data = req.body
        // let currUserId = await searchUser( { req.userId } )
        console.log(data)
        switch (data.action) {
            case 'follow':
                console.log('following user')
                // currUser will follow
                if (data.payload.followerUsername && data.payload.followedUsername) {
                    await follow(data.payload.followerUsername, data.payload.followedUsername)
                    res.json({success: true})
                    res.send()
                }

                break
            case 'unfollow':
                await unfollow(data.payload.followerUsername, data.payload.followedUsername)
                res.json({success: true})
                res.send()
                break
            default:
                res.sendStatus(402)
                break
        }
    })
router.route('/signup')
    .post(upload.single('avatar'), async (req, res) => {
        // accept the data
        let status
        const data = req.body
        console.log(req.file)
        if (req.file) data.avatar = req.file.filename
        console.log(data)
        let taken = []
        status = await searchUser({username: data.username})
        if (status.result && status.result.length) taken.push('username')
        status = await searchUser({email: data.email})
        if (status.result && status.result.length) taken.push('email')
        if (taken.length) {
            status = {}
            status.success = false
            status.message = `${taken.join(' and ')} already taken`
        } else
            status = await createNewUser(data)
        // console.log(data)
        res.json(status)

    })

router.route('/login')
    .post(async (req, res) => {
        let data = req.body
        // console.log(data)
        let status = {}
        try {
            // find out the user with username and match the password
            let user = await logInUser(data)
            if (user) {
                status.success = true
                let payload = {...user}

                let refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
                try {
                    await updateRefreshToken(data.username, refreshToken)
                    status.accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
                        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
                    status.refreshToken = refreshToken
                    status.username = user.username
                } catch (e) {
                    status.success = false
                    status.message = e.message
                }
            } else {
                status.success = false
                status.message = "Invalid credential!"
            }
        } catch (e) {
            status.success = false
            status.message = e.message
        }
        // create refreshToken with a long expiry and store in the users table (will be deleted when user is logout)
        res.json(status)
    })

router.route('/logout')
    .post(async (req, res) => {
        console.log(req.body)
        let { username } = req.body
        try {
            await logOutUser(username)
            res.sendStatus(200)
        } catch (e) {
            console.log(e.message)
            res.sendStatus(304)
        }
    })
router.route('/suggestions')
    .get(verifyRequestHeader, async (req, res) => {
        // console.log(req.username)
        let status = await searchUser({_id: {$ne: req.userId}, followers: {$ne: req.username}})
        if (status.result.length) {
            status.result = status.result.map(r => ({
                username: r.username,
                followers: r.followers.length,
                isFollowing: r.followers.includes(req.username),
            }))
        }
        // console.log(status.result)
        res.json(status)
    })
router.route('/token')
    .post(async (req, res) => {
        // request new accessToken
        let refreshToken = req.body.refreshToken
        let unAuthorized = true
        if (refreshToken) {
            // refreshToken is provided
            try {
                let {userId, username} = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
                let accessToken = await jwt.sign({userId, username}, process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
                res.json({success: true, accessToken, username: user.username})
                unAuthorized = false
            } catch (e) {
                console.log(e.message)
            }
        }
        // refreshToken is expired
        if (unAuthorized)
            res.sendStatus(403)
    })


module.exports = router