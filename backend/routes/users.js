const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcrypt')
const verify = require('./verify')

//SEARCH 2 Users
router.get('/search',async(req,res)=>{
    let SearchOption={}
    const username = req.query.username.replace(/^\s+|\s+$/gm,'')
    if(username!=='' && username !== ' ')
    {
        SearchOption.username = new RegExp(username,'i')
    }
    try{
        const users = await User.find(SearchOption)
        if(users.length > 2){
            const searchResponse = users.slice(0,2)
            res.status(200).json(searchResponse)
        }else {
            res.status(200).json(users)
        }
    }catch(e){
        return res.status(500).json(e)
    }
})

//UPDATE
router.put('/:id',verify,async(req,res)=>{
    if(req.user._id===req.params.id || req.user.isAdmin){
        if(req.body.password)
        {

                req.body.password = await bcrypt.hash(req.body.password,10)
 
        }
        try{
            user = await User.findByIdAndUpdate(req.params.id,{$set:req.body})
            res.status(200).json('Account is updated')
        }
        catch(e){
            return res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You can update only your profile')
    }
})

//DELETE
router.delete('/:id',verify,async(req,res)=>{
    if(req.user._id===req.params.id || req.user.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json('Account is deleted')
        }
        catch(e){
            return res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You can delete only your profile')
    }
})

//GET
router.get('/',verify,async(req,res)=>{
    let userId = req.query.userId
    const username = req.query.username
    if(!userId && !username){userId = req.user._id}
    try{
        const user = userId? await User.findById(userId):await User.findOne({username:username})
        
        const {password,updatedAt,...other} = user._doc
        res.status(200).json(other)
    }catch(e){
        res.status(500).json(e)
    }
})

//GET FRIENDS
router.get("/friends/:userId",verify,async(req,res)=>{
    try{
        const user = await User.findById(req.params.userId)
        const friends = await Promise.all(
            user.following.map(friendId=>{
                return User.findById(friendId)
            })
        )
        let friendList = []
        friends.map(friend =>{
            const {_id,username,profilePicture} = friend
            friendList.push({_id,username,profilePicture})
        })
        res.status(200).json(friendList)
    }catch(e){
        res.status(500).json(e)
    }
})

//FOLLOW
router.put('/:id/follow',verify,async (req,res)=>{
    if(req.user._id !== req.params.id)
    {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.user._id)
            if(!user.followers.includes(req.user._id))
            {
                await user.updateOne({$push:{followers:req.user._id}})
                await currentUser.updateOne({$push:{following:req.params.id}})
                res.status(200).json("Follow successfull")
            }else{
                res.status(403).json("you already follow")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }else{
        res.status(403).json("You cannot follow yourself")
    }
})



//UNFOLLOW
router.put('/:id/unfollow',verify,async (req,res)=>{
    if(req.user._id !== req.params.id)
    {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.user._id)
            if(user.followers.includes(req.user._id))
            {
                await user.updateOne({$pull:{followers:req.user._id}})
                await currentUser.updateOne({$pull:{following:req.params.id}})
                res.status(200).json("Unfollow successfull")
            }else{
                res.status(403).json("you already unfollow")
            }
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }else{
        res.status(403).json("You cannot unfollow yourself")
    }
})
module.exports = router