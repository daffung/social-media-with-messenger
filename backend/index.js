if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const express = require('express')
const app = express()
const path = require("path")
const multer = require('multer')

const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const conversationRoute = require('./routes/conversations')
const messageRoute = require('./routes/messages')
const commentRoute  = require('./routes/comment')
const verify = require('./routes/verify')


app.use("/images",express.static(path.join(__dirname,"public/images")))
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))
app.use(express.urlencoded())

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/images")
  },
  filename:(req,file,cb)=>{
    cb(null,req.body.name)
  }
})
const upload = multer({storage})
app.post("/api/upload",upload.single("file"),(req,res)=>{
  try{
    return res.status(200).json("File upload Successfully")
  }catch(e){
    console.log(e)
  }
})


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology:true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/api/user',userRoute)
app.use('/api/auth',authRoute)
app.use('/api/post',postRoute)
app.use('/api/conversation',conversationRoute)
app.use('/api/message',messageRoute)
app.use('/api/comment',commentRoute)
//app.disable('etag');
app.listen(process.env.PORT||8800,()=>{console.log("server is running")})