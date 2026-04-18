import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



// Fetch all chats for the logged-in user (for the sidebar)
export const fetchChats = asyncHandler(async(req,res) => {
       

    // - this symbol is mean by exclude -password = exclude password
    // .populate is used to replace the details with other detaisl in line no 16 userid replaced by users full date users is mena by all data of User user.model.js
    // .populate(latestMessage) replaces message.id with full message data with content
    // .sort updated -1 refers that recent chats will be showwn on the top of the sidebar

    // elemMatch is used to find the users are in array or not  users: [user1_id, user2_id] If req.user._id === user1_id → match ✅ checks if users id matched or not
    const chats = await Chat.find({users : {$elemMatch: {$eq: req.user._id}}})
    .populate("users" , "-password")
    .populate("groupAdmin" , "-password")
    .populate("latestMessage")
    .sort({updatedAt: -1});

     res.status(200)
        .json(new ApiResponse(200, chats, "Chats fetched successfully"));
});

// Create a new groupChat


export const createGroupChat = asyncHandler( async (req,res) => {
    // THese are details that are required during th cereation of the group
    //  users → list of users to add in group name → group name
    
    if(!req.body.name){
        throw new ApiError(400 , "Please enter a Group Name!")
    }

    let users = [];
    if(req.body.users) {
        try {
            users = JSON.parse(req.body.users); 
        } catch {
            throw new ApiError(400 , "Invalid users format")
        }
    }

    users.push(req.user._id) // add the creator to the group

    users = [...new Set(users.map(id => id.toString()))]; // to dont allow the duplicate users set doesnot allow duplicates values

    const groupChat = await Chat.create({
        chatName : req.body.name,
        users : users,
        isGroupChat : true,
        groupAdmin :  req.user._id // creator becomes the admin
    });
  // create() returns raw IDs
  // .populate() gives full user details
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(new ApiResponse(200, fullGroupChat, "Group created"));
});



/*

request
{
  "name": "Friends Group",
  "users": "[\"id1\",\"id2\"]"
} 
  
response
{
  "chatName": "Friends Group",
  "users": [{name:"A"}, {name:"B"}, {name:"You"}],
  "groupAdmin": {name:"You"}
}
*/

// Access or Create a 1-on-1 Chat
export const accessChat = asyncHandler(async (req, res) => {
    // The userId of the person we want to start a chat with
    const { userId } = req.body; 

    if (!userId) {
        throw new ApiError(400, "UserId param not sent with request");
    }

    // Step 1: Does a chat already exist between us and them?
    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $all: [req.user._id, userId] } }
        ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

    // If chat exists, return it! 
    if (isChat.length > 0) {
        res.status(200).json(new ApiResponse(200, isChat[0], "Existing Chat fetched"));
    } else {
        // Step 2: If a chat doesn't exist, Create a fresh one!
        var chatData = {
            chatName: "Direct Message",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(new ApiResponse(200, FullChat, "Chat created successfully"));
        } catch (error) {
            throw new ApiError(400, error.message);
        }
    }
});

// Add user to Group
export const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin
    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        throw new ApiError(404, "Chat Not Found");
    } else {
        res.status(200).json(new ApiResponse(200, added, "User added to Group"));
    }
});

// Remove user from Group (Exit group)
export const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        throw new ApiError(404, "Chat Not Found");
    } else {
        res.status(200).json(new ApiResponse(200, removed, "User removed from Group"));
    }
});

// Delete chat completely
export const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat Not Found");
    }

    // Check if user is part of the chat or admin
    if (!chat.users.includes(req.user._id) && chat.groupAdmin?.toString() !== req.user._id.toString()) {
         throw new ApiError(403, "Not authorized to delete this chat");
    }

    await Chat.findByIdAndDelete(chatId);
    // Delete all messages associated with this chat
    await Message.deleteMany({ chat: chatId });

    res.status(200).json(new ApiResponse(200, null, "Chat deleted successfully"));
});