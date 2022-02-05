const router = require('express').Router()
const Message = require('../model/Message')
const verify = require("./verify")
const Conversation = require('../model/Conversation')

//add
router.post('/', verify, async (req, res) => {
    const newMessage = new Message(req.body)
    const conversation = await Conversation.findById(req.body.conversationId)
    if (req.body.sender === req.user._id && conversation.members.includes(req.user._id)) {
        try {
            const savedMessage = await newMessage.save()

            res.status(200).json(savedMessage)
        } catch (e) {
            res.status(500).json(e)
        }
    } else {
        res.status(403).json("Forbidden")
    }
})
//get
router.get('/:conversationId', verify, async (req, res) => {

    const conversation = await Conversation.findById(req.params.conversationId)

    if (conversation.members.includes(req.user._id)) {
        try {
            const message = await Message.find({
                conversationId: req.params.conversationId
            })
            res.status(200).json(message)
        } catch (e) {
            res.status(500).json(e)
        }
    }
    else {
        res.status(403).json("Forbidden")
    }
})

module.exports = router