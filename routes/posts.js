const express = require('express')
const router = express.Router()

// jwt
const verifyHeaders = require('../middlewares')
const {getFeed} = require("../models/users/controller");
const {searchUser} = require("../models/users/controller");

const {
    searchPost, createNewPost, deletePost, likePost, dislikePost

} = require('../models/posts/controller')
router.use(verifyHeaders)

router.route('/feed')
    .get(async (req, res) => {
        let feed = await getFeed(req.userId)
        feed.username = req.username
        feed.result = feed.result.map(r=>{
            r.liked = r.like.includes(req.userId)
            return r
        })
        // console.log(feed)
        res.json(feed)
    })
router.route('/:postId?')
    // .get(async (req, res) => {
    //     let currentUser
    //     let userSearchStatus = await searchUser({_id: req.userId})
    //     if (userSearchStatus.result.length) {
    //         currentUser = userSearchStatus.result[0]
    //         let status = await searchPost()
    //         if (status.result.length) status.result = status.result.map(r => {
    //             r.liked = r.like.includes(req.userId)
    //             // console.log(r)
    //             return r
    //         })
    //         status.username = currentUser.username
    //         res.json(status)
    //         // res.send()
    //     }
    //     // console.log(currentUser)
    //     // let status = await searchPost({_id: {$in: currentUser.posts}})
    //     // add a new attribute liked to each post in result array
    // })
    .post(async (req, res) => {
        let data = req.body
        data.authorID = req.userId
        console.log(data)
        let status = await createNewPost(data)
        res.json(status)
    })
    .delete(async (req, res) => {
        let postId = req.params.postId
        let ret = await searchUser({"_id": req.userId, "posts": {$in: [postId]}})
        console.log(ret)
        if (!ret.result.length) res.sendStatus(401)
        else {
            let status = await deletePost(postId, req.userId)
            res.json(status)
        }
    })
    .patch(async (req, res) => {
        console.log('updating post')
        let data = req.body
        let postId = req.params.postId
        let status = await searchPost({_id: postId})
        let postObj = status.result[0]
        switch (data.action) {
            case 'like':
                if (!postObj.like.includes(req.userId)) {
                    let ret = await likePost(postId, req.userId)
                    res.json(ret)
                    res.send()
                }
                break
            case 'dislike':
                if (postObj.like.includes(req.userId)) {
                    let ret = await dislikePost(postId, req.userId)
                    res.json(ret)
                    res.send()
                }
                break
            default:
                console.log('invalid action', data.action)
                res.json({success: false})
                break
        }
    })


module.exports = router