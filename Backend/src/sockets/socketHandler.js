export const handleSockets = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join the user to their own personal room upon login
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    // 🔴 NEW: Join a specific chat room (called when clicking a chat in the sidebar)
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat room: ${chatId}`);
    });

    // 🔴 NEW: Target the message heavily into specific personal user rooms
    socket.on("send_message", (data) => {
      // data contains { chatId, message: { ..., sender, chat: { users: [...] } } }
      const chat = data.message?.chat;

      if (!chat || !chat.users || chat.users.length === 0) {
        // Fallback if chat details aren't populated for some reason
        return socket.to(data.chatId).emit("receive_message", data);
      }

      // Ensure the sender's ID is resolved
      const senderId = data.message.sender?._id || data.message.sender;

      chat.users.forEach((user) => {
        const userId = user._id || user; // Works for full populated object or simple ObjectId
        
        // Don't send back to the user who just sent the message
        if (userId.toString() === senderId?.toString()) return;

        // Broadcast directly to the recipient's personal socket room
        socket.to(userId.toString()).emit("receive_message", data);
      });
    });

    // 🔴 NEW: Handle editing
    socket.on("edit_message", (data) => {
      const chat = data.message?.chat;
      if (!chat || !chat.users) return socket.to(data.chatId).emit("message_edited", data);
      
      const senderId = data.message.sender?._id || data.message.sender;
      chat.users.forEach(user => {
        const userId = user._id || user;
        if (userId.toString() === senderId?.toString()) return;
        socket.to(userId.toString()).emit("message_edited", data);
      });
    });

    // 🔴 NEW: Handle reactions
    socket.on("add_reaction", (data) => {
      const chat = data.message?.chat;
      if (!chat || !chat.users) return socket.to(data.chatId).emit("reaction_added", data);
      
      const senderId = data.senderId || data.message.sender?._id || data.message.sender; // User who added the reaction
      chat.users.forEach(user => {
        const userId = user._id || user;
        if (userId.toString() === senderId?.toString()) return;
        socket.to(userId.toString()).emit("reaction_added", data);
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};
