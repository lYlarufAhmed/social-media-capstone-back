const express = require('express')
const router = express.Router()

// for saving form file
const multer = require('multer')
// jwt
const jwt = require('jsonwebtoken')

const {
    logInUser, searchUser, createNewUser,
    updateRefreshToken, logOutUser
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

router.route('/')
    .get(async (req, res) => {
        let status = await searchUser()
        res.json(status)
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
        console.log(data)
        let status = {}
        try {
            // find out the user with username and match the password
            let userId = await logInUser(data)
            if (userId) {
                status.success = true
                let payload = {userId}

                let refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
                try {
                    await updateRefreshToken(data.username, refreshToken)
                    status.accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
                        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
                    status.refreshToken = refreshToken
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
    .get(async (req, res) => {
        let userId = req.body.userId
        try {
            await logOutUser(userId)
        } catch (e) {
            console.log(e.message)
        }
        res.sendStatus(200)
    })

router.route('/token')
    .post(async (req, res) => {
        // request new accessToken
        let refreshToken = req.body.refreshToken
        if (refreshToken) {
            // refreshToken is provided
            try {
                let payload = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
                let accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
                res.json({success: true, accessToken})
                res.send()
            } catch (e) {
                console.log(e.message)
            }
        }
        // refreshToken is expired
        res.sendStatus(403)
    })


module.exports = router