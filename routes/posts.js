const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

// jwt
const verifyHeaders = require('../middlewares')
const {searchUser} = require("../models/users/controller");

const {
    searchPost, createNewPost, deletePost

} = require('../models/posts/controller')
router.use(verifyHeaders)

router.route('/:postID?/')
    .get(async (req, res) => {
        let status = await searchPost()
        res.json(status)
    })
    .post(async (req, res) => {
        let data = req.body
        // let accessToken = req.headers['authorization'].split(' ')[1]
        // let {userId} = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        data.authorID = req.userId
        console.log(data)
        let status = await createNewPost(data)
        res.json(status)
    })
    .delete(async (req, res) => {
        let postID = req.params.postID
        let ret = await searchUser({"_id": req.userId, "posts": {$in: [postID]}})
        console.log(ret)
        if (!ret.result.length) res.sendStatus(401)
        else {
            let status = await deletePost(postID, req.userId)
            res.json(status)
        }
    })

module.exports = router