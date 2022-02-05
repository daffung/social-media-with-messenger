const router = require('express').Router()
const Conversation = require('../model/Conversation')
const verify = require("./verify")

//new conv
/*
body:{
    members:[]
}
*/
router.post('/',verify,async (req,res)=>{
    if(req.body.members.includes(req.user._id))
    {
        
        const newConversation = new Conversation({
        members:req.body.members
        })
    try {
        const members = req.body.members     
        let userConversations = await Conversation.find({
            members:{$in:[req.user._id]}
        })
         userConversations = userConversations.filter(conv => conv.members.length === members.length)
        if(userConversations.length !== 0){
            for(let i=0;i<members.length;i++){
                userConversations = userConversations.filter(conv => conv.members.includes(members[i]))
            }
            if(userConversations.length !== 0){
                res.status(403).json('there are a conversation already')
            }
            else{
                const savedConversation = await newConversation.save()
                res.status(200).json(savedConversation)
            }
        }  
        else{
            const savedConversation = await newConversation.save()
            res.status(200).json(savedConversation)
        }
        
    } catch (error) {
        res.status(500).json(error)
    }}else{
        res.status(403).json('Forbidden')
    }
})

//get conv of a user
router.get("/",verify,async (req,res)=>{
    try {
        const conversation = await Conversation.find({
            members:{$in:[req.user._id]}
        })
        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json(error)
    }
})
//update another is unreader when send message
router.put("/:conversationId/unread",verify,async(req,res)=>{
    const conversation = await Conversation.findById(req.params.conversationId)
    const unreader = conversation.members.filter(m => m !== req.user._id)
    try {
        await conversation.updateOne({ $set: { unreader: conversation.members.filter(m => m !== req.user._id) } })
        res.status(200).json(unreader)
    } catch (error) {
        res.status(500).json(error)
    }
})
//update seen for reader
router.put("/:conversationId/seen",verify,async(req,res)=>{
    try {
        const conversation = await Conversation.findById(req.params.conversationId)
        if(conversation.unreader.includes(req.user._id))
        {
            await conversation.updateOne({ $pull: { unreader:req.user._id}})
        }
        res.status(200).json("seen successfully")
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router