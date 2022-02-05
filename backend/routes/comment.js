const router = require('express').Router()
const Comment = require('../model/Comment')
const verify = require('./verify')

//Create a comment
router.post("/", verify, async (req, res) => {
    const newComment = new Comment({
        userId: req.user._id,
        ...req.body
    })
    try {
        const savedComment = await newComment.save()
        res.status(200).json(savedComment)
    } catch (error) {
        res.status(500).json(error)
    }
})
//get a comment
router.get("/:id", verify, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
        res.status(200).json(comment)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})
//get comments of a post which are not children and number of comments
router.get("/all/:postId", verify, async (req, res) => {
    try {
        const comments  = await Comment.find({postId:req.params.postId})
        const notChildrenComments = comments.filter(c => c.parentId === undefined)
        res.status(200).json({notChildrenComments:notChildrenComments,numberOfComments:comments.length})
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
})
//get children of a parent
router.get("/children/:parentId", verify, async (req, res) => {
    try {
        const children = await Comment.find({parentId:req.params.parentId})
        res.status(200).json(children)
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
})
//like and dislike a comment
router.put('/:id/like', verify, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
        if (!comment.likes.includes(req.user._id)) {
            await comment.updateOne({ $push: { likes: req.user._id } })
            res.status(200).json("Like a comment succesfully")
        } else {
            await comment.updateOne({ $pull: { likes: req.user._id } })
            res.status(200).json("Dislike a comment succesfully")
        }
    } catch (error) {
        res.status(500).json(error)

    }
})
//update
//delete


module.exports = router