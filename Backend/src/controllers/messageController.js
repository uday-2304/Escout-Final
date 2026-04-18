import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const allMessages = asyncHandler(async(req,res) => {

    // This is used to fetch all messages in that respected chat
    const messages = await Message.find({chat : req.params.chatId})
    // Dont populate sendr means user id who is sending just only populate userName and email 
    // replaces chatId with chat object in the chat controler code
                      .populate("sender" , "userName email")
                      .populate("chat")

   res.status(200).json(new ApiResponse(200 , messages , "Messages are Fetched"))

   /*
   📥 Request
GET /api/messages/123
⚙️ Backend
Find all messages of chat 123
Attach sender info
Attach chat info

📤 Response
Array of messages with full details

   */
});

// Send a new message (Saves to DB, Socket.io handles the real-time push)

export const sendMessage = asyncHandler(async(req,res) => {
    // Getting info from the frontend
    const {chatId, content, type, fileUrl} = req.body

// sender comes from auth middleware
//So user cannot fake sender ❌

    let newMessage = {
        sender : req.user._id,
        chat : chatId,
        content : content || " ",
        type : type || 'text',  // Type will be text unless when pass image/file
        fileUrl : fileUrl || null  // While sending the url of images
    };

// Saving the message in db before populating to the group individuals 
    let message = await Message.create(newMessage)
        message = await message.populate("sender" , "userName email")
        message = await message.populate("chat")

/*
   Without this:

Chat list cannot show last message ❌

With this:

Sidebar shows latest message ✅
   */
    await Chat.findByIdAndUpdate(chatId , {latestMessage : message._id});

    res.status(200).json(new ApiResponse (200 , message , "Message Sent"))
})




// This part of code for the editing message
export const editMessage = asyncHandler( async(req,res) => {
    const {messageId , newContent} = req.body;

       const updateMessage = await Message.findByIdAndUpdate(
        messageId,
        {content : newContent , isEdited : true},
        {new : true} // returns new document payload
       ).populate("sender" , "userName email") // excludes the sender id and only populate name
       .populate("chat");

       res.status(200).json(new ApiResponse(200 , updateMessage , "Message edited successfully"))
    })

// This part handles adding emoji reactions to a message
export const addReaction = asyncHandler( async(req, res) => {
    const { messageId, emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    // Remove existing reaction by this user if any
    message.reactions = message.reactions.filter(r => r.user && r.user.toString() !== req.user._id.toString());
    message.reactions.push({ user: req.user._id, emoji });
    
    await message.save();
    const updatedMsg = await Message.findById(message._id).populate("sender", "userName email").populate("chat");
    
    res.status(200).json(new ApiResponse(200, updatedMsg, "Reaction added"));
})
