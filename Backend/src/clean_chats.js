import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const cleanChats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "escout" }); // Assuming escout is the dbName based on common patterns, but Mongoose will connect to default in URI
        
        // Let's connect using the DB URI
        console.log("Connected to MongoDB.");

        const ChatSchema = new mongoose.Schema({
            chatName: String,
            isGroupChat: Boolean,
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }, { timestamps: true });
        
        const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
        
        const allChats = await Chat.find();
        console.log("Total chats before cleanup:", allChats.length);
        
        // Loop and see how many are corrupted
        let deleted = 0;
        for (const chat of allChats) {
            if (!chat.isGroupChat && (!chat.users || chat.users.length !== 2)) {
                await Chat.findByIdAndDelete(chat._id);
                deleted++;
            }
        }
        console.log(`Deleted ${deleted} corrupted 1-on-1 chats.`);
        
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

cleanChats();
