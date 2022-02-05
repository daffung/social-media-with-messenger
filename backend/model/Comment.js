const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    postId:{
        type:String,
        required:true,
    },
    parentId:{
        type:String
    },
    desc:{
        type:String,
        max:500
    },
    img:{
        type:String
    },
    likes:{
        type:Array,
        default:[]
    },
    
},{timestamps:true})
module.exports = mongoose.model("Comment",commentSchema)