import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
       sender : {type : mongoose.Schema.Types.ObjectId , ref : "User"},
       content : {type : String , trim : true},
       chat : {type : mongoose.Schema.Types.ObjectId , ref : "Chat"},
       readBy : [{type : mongoose.Schema.Types.ObjectId , ref : "User"}], // This is for blue ticks to see whether user read the message

       type : {type : String  , enum : ['text','image','file'] , default : 'text'},
       fileUrl : {type : String},
       isEdited : {type : Boolean , default : false},

       reactions : [{
         user : {type : mongoose.Schema.Types.ObjectId , ref : "User"},
         emoji : {type : String}
       }]
} , {timestamps : true})

export const Message = mongoose.model("Message" , messageSchema)