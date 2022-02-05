const router = require('express').Router()
const Post = require('../model/Post')
const User = require('../model/User')
const verify = require('./verify')


//create a post
router.post("/", verify, async (req, res) => {
    const newPost = new Post({
        userId: req.user._id,
        ...req.body
    })
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

//UPDATE a post
router.put("/:id", verify, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.user._id) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("update successfully")
        } else {
            res.status(403).json("you can update only your post")
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }

})


//DELETE a post
router.delete("/:id", verify, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.user._id) {
            await post.deleteOne()
            res.status(200).json("delete successfully")
        } else {
            res.status(403).json("you can delete only your post")
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }

})

//like adn dislike a post
router.put('/:id/like', verify, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.user._id)) {
            await post.updateOne({ $push: { likes: req.user._id } })
            res.status(200).json("Like succesfully")
        } else {
            await post.updateOne({ $pull: { likes: req.user._id } })
            res.status(200).json("Dislike succesfully")
        }
    } catch (error) {
        res.status(500).json(error)

    }
})

//get a post
router.get("/:id", verify, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get timelines
router.get('/timeline/:userId', verify, async (req, res) => {
    if (req.user._id === req.params.userId || req.user.isAdmin) {
        try {
            const currentUser = await User.findById(req.user._id)

            const userPosts = await Post.find({ userId: req.user._id })
            const friendpost = await Promise.all(
                currentUser.following.map(friendId => {
                    return Post.find({ userId: friendId })
                })
            )

            res.status(200).json(userPosts.concat(...friendpost))

        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }else{
        return res.status(403).json('You can get only your timeline')
    }
})
//get user's all post
router.get('/profile/:username', verify, async (req, res) => {

    try {
        const user = await User.findOne({ username: req.params.username })

        const posts = await Post.find({ userId: user._id })


        res.status(200).json(posts)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})
module.exports = router