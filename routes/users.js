const express = require('express')
const router = express.Router()

// for saving form file
const multer = require('multer')
// jwt
const jwt = require('jsonwebtoken')

const {logInUser, searchUser, createNewUser,
    updateRefreshToken, logOutUser} = require('../models/users/controller')


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
        const data = req.body
        console.log(data)
        console.log(req.file)
        if (req.file) data.avatar = req.file.filename
        let status = await createNewUser(data)
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
            let email = await logInUser(data)
            if (email) {
                status.success = true
                let payload = {email}

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
    .post(async (req, res) => {
        let data = req.body
        console.log(data)
        try{
            await logOutUser(data)
        } catch (e) {
            console.log(e.message)
        }
        res.sendStatus(200)
    })


module.exports = router