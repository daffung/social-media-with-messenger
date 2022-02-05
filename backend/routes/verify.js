const jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
    let token
   if(req.headers.cookie && req.headers.cookie.search('accessToken=') !== -1)
   {
       const accessTokenBeginIndex = req.headers.cookie.search('accessToken=')
       const accessTokenEndIndex = req.headers.cookie.search('; ')
       if (accessTokenBeginIndex < accessTokenEndIndex) 
        token = req.headers.cookie.slice(accessTokenBeginIndex+12,accessTokenEndIndex)
        else {
            token = req.headers.cookie.slice(accessTokenBeginIndex+12)
        }
   }
    if(!token) return res.status(401).send('Access Denied. You are not Authenticated')
    try{
        const verified = jwt.verify(token,'mySecretKey')
        req.user = verified
        next()
    }catch(e){
        console.log(e)
        res.status(403).json("Token Invalid")
    }
}