const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verify = require('./verify')



const generateAccessToken = (user) =>{
    return jwt.sign({_id:user._id,username:user.username,isAdmin:user.isAdmin},'mySecretKey',{expiresIn:'45m'})
}
const generateRefreshToken = (user) =>{
    //save to DB
    return jwt.sign({_id:user._id,username:user.username,isAdmin:user.isAdmin},'mySecretRefreshKey',{expiresIn:'45m'})
}

//REGISTER
router.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password,10)
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })
    try {
        const newuser = await user.save()
        res.status(200).json(newuser)
    }
    catch (e) {
        console.log(e)
        res.status(400).json('Error create new User')
    }
})

//LOGIN
router.post('/login',async (req,res)=>{
    try{
        const userExist = await User.findOne({email: req.body.email})
        if (!userExist) return res.status(404).json("There is not this user already")
        if(await bcrypt.compare(req.body.password,userExist.password))
        {
            const accessToken = generateAccessToken(userExist)
            const refreshToken = generateRefreshToken(userExist)
            const CreatedDate = Date.now()
            res.cookie('accessToken',accessToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                expires:new Date(Date.now()+5000)
            })
            res.cookie('refreshToken',refreshToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                expires:new Date(Date.now()+45*60*1000)
            })
            res.status(200).json({...userExist._doc,accessToken,CreatedDate})
        }
        else{
            res.status(400).json("wrong password")
        }
    }
        catch(e){
            console.log(e)
            res.status(500).json('Error log in ')
        }
})
router.get('/logout',verify,(req,res)=>{
    res.cookie('accessToken',null,{expires:new Date(Date.now())})
    res.cookie('refreshToken',null,{expires:new Date(Date.now())})
    //delete refreshToken in DB
    //
    res.status(200).json('You are loged out')
})
router.get('/refresh',(req,res)=>{
    const refreshToken = req.headers.cookie && req.headers.cookie.split(";")[0] && req.headers.cookie.split(";")[0].split("=")[0] === 'refreshToken' && req.headers.cookie.split(";")[0].split("=")[1]
    //console.log(refreshToken)
    if(!refreshToken) return res.status(401).send('Access Denied. You are not Authenticated')
    /*
    check refresh token is existed in DB ?
    */
    try {
        const user = jwt.verify(refreshToken,'mySecretRefreshKey')
        const accessToken = generateAccessToken(user)
        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            expires:new Date(Date.now()+45000)
        })
        res.status(200).json(accessToken)
    } catch (error) {
        console.log(error)
        res.status(500).json("RefreshToken Invalid")
    }
})
module.exports = router