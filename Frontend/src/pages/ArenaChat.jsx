import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Send, CheckCheck, Mic, Smile, Search, Paperclip, Plus, MoreVertical, Edit2, X, Image as ImageIcon, FileText, Trash2, LogOut, Menu } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://escout-esports-scouting-platform-1.onrender.com";

const AdvancedChat = () => {
  const socket = useRef(null);
  const location = useLocation();
  const rawUserInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  // If stored info is nested under "user", extract it natively, else use the object directly
  const loggedUser = rawUserInfo.user || rawUserInfo;
  const token = localStorage.getItem("token") || rawUserInfo.accessToken;
  
  // Extra security to ensure we have the True User ID even if storage clears partially
  let decodedToken = {};
  if (token) {
    try {
      decodedToken = JSON.parse(atob(token.split('.')[1]));
    } catch(e) {}
  }
  const myUserId = loggedUser._id || loggedUser.id || loggedUser.userId || decodedToken.id || decodedToken._id;

  // Create an axios instance with auth
  const api = axios.create({
      baseURL: BACKEND_URL,
      headers: { Authorization: `Bearer ${token}` }
  });

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, text: "", onConfirm: null });

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  useEffect(() => {
      api.get("/api/v1/users/all").then(res => setPlatformUsers(res.data.data || [])).catch(err => console.error(err));
  }, []);

  // 1. Initialize Socket Connection & Receive Messages
  useEffect(() => {
    socket.current = io(BACKEND_URL, {
      withCredentials: true,
    });

    socket.current.emit("setup", loggedUser);

    socket.current.on("connect", () => {
      console.log("Connected to WebSocket with ID:", socket.current.id);
    });

    socket.current.on("receive_message", (data) => {
      const m = data.message;
      const mappedMsg = (data.message._id) ? {
          id: m._id,
          text: m.content || "",
          type: m.type || 'text',
          sender: (m.sender?._id || m.sender) === myUserId ? "me" : "other",
          senderName: m.sender?.userName || m.sender?.name || "Member",
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "read",
          reactions: (m.reactions || []).map(r => r.emoji || r),
          isEdited: m.isEdited,
          url: m.fileUrl
      } : data.message;

      setMessages((prev) => {
        const currentMsgs = prev[data.chatId] || [];
        // Prevent duplicate rendering
        if (currentMsgs.some(msg => msg.id === mappedMsg.id)) return prev;
        return {
          ...prev,
          [data.chatId]: [...currentMsgs, mappedMsg]
        };
      });

      // Update sidebar latest message for real-time order bumping (if needed)
      fetchChats();
    });

    socket.current.on("message_edited", (data) => {
      setMessages(prev => {
        const chatMsgs = prev[data.chatId] || [];
        return {
          ...prev,
          [data.chatId]: chatMsgs.map(m => m.id === data.message._id ? { ...m, text: data.message.content, isEdited: true } : m)
        };
      });
    });

    socket.current.on("reaction_added", (data) => {
      setMessages(prev => {
        const chatMsgs = prev[data.chatId] || [];
        return {
          ...prev,
          [data.chatId]: chatMsgs.map(m => {
            if (m.id === data.message._id) {
               return { ...m, reactions: (data.message.reactions || []).map(r => r.emoji || r) };
            }
            return m;
          })
        };
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  // 2. Fetch all chats on load
  const fetchChats = async () => {
      try {
          const res = await api.get("/api/chat");
          setChats(res.data.data || []);
      } catch (err) {
          console.error("Failed to fetch chats", err);
      }
  };

  useEffect(() => {
     fetchChats();
  }, []);

  // 3. Initiate Chat from Profile/Scout Routing
  useEffect(() => {
      if(location.state?.targetUserId) {
          api.post("/api/chat", { userId: location.state.targetUserId })
             .then(res => {
                 const createdOrFetchedChat = res.data.data;
                 setActiveChatId(createdOrFetchedChat._id);
                 fetchChats(); // Refresh sidebar to show the new chat
             })
             .catch(err => console.error("Error creating chat", err));
      }
  }, [location.state]);

  // 4. Fetch specific chat's messages and Join Socket Room
  useEffect(() => {
     if(activeChatId) {
         api.get(`/api/messages/${activeChatId}`)
            .then(res => {
                const mappedMessages = (res.data.data || []).map(m => ({
                    id: m._id,
                    text: m.content || "",
                    type: m.type || 'text',
                    sender: (m.sender?._id || m.sender) === myUserId ? "me" : "other",
                    senderName: m.sender?.userName || m.sender?.name || "Member",
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "read",
                    reactions: (m.reactions || []).map(r => r.emoji || r),
                    isEdited: m.isEdited,
                    url: m.fileUrl
                }));
                setMessages(prev => ({...prev, [activeChatId]: mappedMessages}));
                socket.current.emit("join_chat", activeChatId);
            })
            .catch(err => console.error("Error fetching messages", err));
     }
  }, [activeChatId]);

  const isInitialLoad = useRef(true);
  const prevActiveChatId = useRef(activeChatId);

  // Auto-scroll to bottom
  useEffect(() => {
    const isChatSwitch = prevActiveChatId.current !== activeChatId;
    if (isInitialLoad.current || isChatSwitch) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoad.current = false;
      prevActiveChatId.current = activeChatId;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeChatId]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentChatId = activeChatId;

    if (editingMsgId) {
       try {
           const res = await api.put("/api/messages/edit", {
               messageId: editingMsgId,
               newContent: inputValue
           });
           const updatedMsg = res.data.data;
           
           setMessages(prev => {
               const chatMsgs = prev[currentChatId] || [];
               return {
                   ...prev,
                   [currentChatId]: chatMsgs.map(m => m.id === updatedMsg._id ? { ...m, text: updatedMsg.content, isEdited: true } : m)
               };
           });
           
           socket.current.emit("edit_message", {
               chatId: currentChatId,
               message: updatedMsg
           });
       } catch (err) {
           console.error("Edit msg failed", err);
       }
       setInputValue("");
       setEditingMsgId(null);
       return;
    }

    try {
        const payload = {
            chatId: currentChatId,
            content: inputValue,
            type: 'text'
        };

        // Hit our backend POST /api/messages
        const res = await api.post("/api/messages", payload);
        const savedMsg = res.data.data;

        // Note: SavedMsg must map to our UI. UI expects properties like .text, .type, .sender
        // To prevent massive UI rewrites below, we wrap the DB message in UI variables
        const mappedMsg = {
            id: savedMsg._id,
            text: savedMsg.content,
            type: savedMsg.type || 'text',
            sender: "me", // Because WE sent it
            time: new Date(savedMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "read", 
            reactions: []
        };

        setMessages(prev => {
            const currentMsgs = prev[currentChatId] || [];
            if (currentMsgs.some(m => m.id === mappedMsg.id)) return prev;
            return {
                ...prev,
                [currentChatId]: [...currentMsgs, mappedMsg]
            };
        });
        
        socket.current.emit("send_message", {
            chatId: currentChatId,
            message: savedMsg // The other person will see it as "other" since we send raw DB object
        });

        fetchChats(); // To update the latestMessage in sidebar
        setInputValue("");
    } catch (err) {
        console.error(err);
    }
  };

  // Group Creation
  const handleCreateGroup = async (e) => {
      e.preventDefault();
      if (!newGroupName.trim() || selectedUsers.length < 1) {
        // We lowered this to < 1 so testing with only 1 other user is permitted instead of mandating 3 total
        return;
      }
      try {
          const res = await api.post("/api/chat/group", {
              name: newGroupName,
              users: JSON.stringify(selectedUsers.map(u => u._id))
          });
          setChats(prev => [res.data.data, ...prev]);
          setShowGroupModal(false);
          setNewGroupName("");
          setSelectedUsers([]);
      } catch (err) {
          console.error("Group creation failed:", err);
      }
  };

  const handleAddMember = async (userId) => {
      if(!userId) return;
      try {
          const res = await api.put("/api/chat/add", {
              chatId: activeChatId,
              userId: userId
          });
          setChats(prev => prev.map(c => c._id === res.data.data._id ? res.data.data : c));
      } catch(err) {
          console.error("Add member failed:", err);
      }
  };

  const handleDeleteChat = () => {
       setConfirmModal({
           isOpen: true,
           text: "Are you sure you want to delete this chat permanently? This action cannot be reversed.",
           onConfirm: async () => {
               try {
                   await api.delete(`/api/chat/${activeChatId}`);
                   setChats(prev => prev.filter(c => c._id !== activeChatId));
                   setActiveChatId(null);
               } catch (err) {
                   console.error("Delete chat failed", err);
               }
               setConfirmModal({ isOpen: false, text: "", onConfirm: null });
           }
       });
  };

  const handleExitGroup = () => {
       setConfirmModal({
           isOpen: true,
           text: "Are you sure you want to exit this group?",
           onConfirm: async () => {
               try {
                   await api.put(`/api/chat/remove`, {
                       chatId: activeChatId,
                       userId: myUserId
                   });
                   setChats(prev => prev.filter(c => c._id !== activeChatId));
                   setActiveChatId(null);
               } catch (err) {
                   console.error("Exit group failed", err);
               }
               setConfirmModal({ isOpen: false, text: "", onConfirm: null });
           }
       });
  };

  const handleFileChange = (e) => {
      // Handled via POST /api/upload
  };

  const handleReaction = async (msgId, emoji) => {
      setShowEmojiPicker(null);
      try {
          const res = await api.put("/api/messages/reaction", {
              messageId: msgId,
              emoji: emoji
          });
          const updatedMsg = res.data.data;
          
          setMessages(prev => {
               const chatMsgs = prev[activeChatId] || [];
               return {
                   ...prev,
                   [activeChatId]: chatMsgs.map(m => m.id === msgId ? { ...m, reactions: (updatedMsg.reactions || []).map(r => r.emoji || r) } : m)
               };
          });
          
          socket.current.emit("add_reaction", {
              chatId: activeChatId,
              message: updatedMsg,
              senderId: myUserId
          });
      } catch (err) {
          console.error("Reaction failed:", err);
      }
  };

  const getChatName = (chat, user) => {
    if(!chat) return "Unknown";
    if(chat.isGroupChat) return chat.chatName;
    if(chat.users) {
        const myId = user._id || user.userId || user.id;
        const otherUser = chat.users.find(u => u._id !== myId);
        return otherUser ? (otherUser.userName || otherUser.name || "User") : (user.userName || user.name || "User");
    }
    return chat.chatName || "Chat";
  };

  const filteredChats = chats.filter(chat => 
    getChatName(chat, loggedUser).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if(!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const activeChatDetails = chats.find(c => c._id === activeChatId) || { chatName: "Chat" };

  return (
    <>
      <style>{`
        /* Scoped to avoid breaking other pages */
        .chat-wrapper-component {
          position: fixed;
          top: 0;
          padding-top: 65px; /* Pushes chat down without exposing background gap */
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          background-color: #0f0f0f;
          z-index: 50;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #e5e5e5;
          overflow: hidden;
        }

        .chat-wrapper-component * {
          box-sizing: border-box;
        }

        .chat-wrapper-component ::-webkit-scrollbar { width: 8px; height: 8px; }
        .chat-wrapper-component ::-webkit-scrollbar-track { background: transparent; }
        .chat-wrapper-component ::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .chat-wrapper-component ::-webkit-scrollbar-thumb:hover { background: #d32f2f; border: 2px solid transparent; background-clip: padding-box; }

        .app-container {
          display: flex;
          height: 100%;
          width: 100%;
        }

        .sidebar {
          width: 320px;
          background-color: #141414;
          border-right: 1px solid #222;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #222;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-bar {
          flex: 1;
          background-color: #0a0a0a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 8px 12px;
          color: #888;
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: #e5e5e5;
          margin-left: 10px;
          width: 100%;
          outline: none;
          font-size: 14px;
        }

        .icon-btn-small {
          background-color: #1e1e1e;
          border: 1px solid #333;
          color: #e5e5e5;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .icon-btn-small:hover { background-color: #d32f2f; border-color: #d32f2f; }

        .chat-list { flex: 1; overflow-y: auto; }

        .chat-item {
          display: flex;
          padding: 15px 20px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chat-item:hover { background-color: #1a1a1a; }
        .chat-item.active {
          background-color: #1e1515;
          border-left: 3px solid #d32f2f;
        }

        .avatar {
          min-width: 45px;
          height: 45px;
          border-radius: 50%;
          background-color: #2a2a2a;
          color: #b0b0b0;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 600;
          font-size: 16px;
          margin-right: 15px;
          border: 1px solid #333;
        }

        .chat-item-details { flex: 1; overflow: hidden; }
        .chat-item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .chat-item-header h4 {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-item-time { font-size: 12px; color: #777; }
        .chat-item-msg {
          font-size: 13px;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .badge {
          background-color: #d32f2f;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          float: right;
          margin-top: -15px;
        }

        .main-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #0d0d0d;
          position: relative;
        }

        .chat-area-header {
          padding: 20px;
          background-color: #141414;
          border-bottom: 1px solid #222;
          display: flex;
          align-items: center;
        }
        .chat-area-header h2 { font-size: 18px; font-weight: 500; display: flex; align-items: center; gap: 8px;}
        .group-badge { font-size: 10px; background: #333; padding: 2px 6px; border-radius: 4px; color: #aaa; }
        .chat-area-header p { font-size: 13px; color: #888; margin-top: 4px; }

        .messages-container {
          flex: 1;
          padding: 65px 30px 30px 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #555;
          font-size: 14px;
        }

        .message-row { display: flex; width: 100%; position: relative; }
        .message-row.me { justify-content: flex-end; }
        .message-row.other { justify-content: flex-start; }

        .message-hover-actions {
          display: none;
          position: absolute;
          top: -15px;
          background: #222;
          border-radius: 20px;
          padding: 4px 8px;
          gap: 8px;
          border: 1px solid #333;
          z-index: 10;
        }
        
        .message-row.me .message-hover-actions { right: 0; }
        .message-row.other .message-hover-actions { left: 0; }

        .message-row:hover .message-hover-actions {
          display: flex;
          align-items: center;
        }

        .action-icon {
          color: #aaa;
          cursor: pointer;
          transition: color 0.2s;
        }
        .action-icon:hover { color: #fff; }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          background: #2a2a2a;
          padding: 8px;
          border-radius: 30px;
          display: flex;
          gap: 8px;
          margin-bottom: 5px;
          border: 1px solid #444;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .message-row.me .emoji-picker { right: -10px; }
        .message-row.other .emoji-picker { left: -10px; }

        .emoji-picker span {
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s;
        }
        .emoji-picker span:hover { transform: scale(1.2); }

        .message-bubble {
          max-width: 65%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 15px;
          line-height: 1.5;
          position: relative;
        }

        .message-row.other .message-bubble {
          background: linear-gradient(135deg, #d30000, #900000);
          color: #fff;
          border-bottom-left-radius: 4px;
          box-shadow: 0 4px 15px rgba(211, 0, 0, 0.15);
        }

        .message-row.me .message-bubble {
          background-color: #1e1e1e;
          color: #e5e5e5;
          border-bottom-right-radius: 4px;
          border: 1px solid #2a2a2a;
        }

        .attachment-preview {
          margin-bottom: 8px;
        }
        .attachment-img {
          max-width: 100%;
          border-radius: 8px;
          margin-bottom: 5px;
        }
        .attachment-file {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.2);
          padding: 10px;
          border-radius: 8px;
        }

        .msg-time {
          display: block;
          font-size: 11px;
          margin-top: 8px;
          text-align: right;
          opacity: 0.7;
        }

        .message-row.me .msg-time {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 5px;
        }
        
        .is-edited {
          font-size: 10px;
          font-style: italic;
          opacity: 0.6;
          margin-right: 5px;
        }

        .reactions-container {
          position: absolute;
          bottom: -15px;
          right: 15px;
          display: flex;
          gap: 2px;
          background: #111;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 12px;
          z-index: 5;
        }
        
        .message-row.other .reactions-container {
          left: 15px;
          right: auto;
        }

        .input-container {
          padding: 20px 30px;
          background-color: #0d0d0d;
          position: relative;
        }
        
        .editing-indicator {
          position: absolute;
          top: -30px;
          left: 40px;
          background: #2a2a2a;
          padding: 4px 12px;
          border-radius: 12px 12px 0 0;
          font-size: 12px;
          color: #aaa;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .editing-indicator button {
          background: none; border: none; color: #fff; cursor: pointer;
        }

        .input-box {
          display: flex;
          align-items: center;
          background-color: #141414;
          border: 1px solid #222;
          border-radius: 30px;
          padding: 10px 20px;
          gap: 15px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .icon-btn:hover { color: #e5e5e5; }
        .input-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e5e5e5;
          font-size: 15px;
          outline: none;
        }
        .input-box input::placeholder { color: #555; }

        .send-btn {
          background-color: #333;
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .send-btn:hover:not(:disabled) { background-color: #d32f2f; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Group Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        .modal-content {
          background: #141414;
          padding: 30px;
          border-radius: 12px;
          width: 400px;
          border: 1px solid #333;
        }
        .modal-content h3 { margin-bottom: 20px; color: #fff; }
        .modal-content input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #333;
          padding: 12px;
          border-radius: 8px;
          color: #fff;
          margin-bottom: 20px;
          outline: none;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          background: transparent; border: none; color: #888; cursor: pointer; padding: 8px 16px;
        }
        .btn-create {
          background: #d32f2f; border: none; color: #fff; cursor: pointer; padding: 8px 16px; border-radius: 6px;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #fff;
          margin-right: 15px;
          cursor: pointer;
        }
        
        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 900px) {
          .app-container {
            flex-direction: column;
            position: relative;
          }
          
          .sidebar-backdrop {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 90;
          }

          .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            height: 100%;
            width: 300px;
            max-width: 85%;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            border-right: 1px solid #333;
            box-shadow: 2px 0 10px rgba(0,0,0,0.5);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .main-chat {
            width: 100%;
            height: 100%;
          }
          
          .mobile-menu-btn {
            display: flex;
            align-items: center;
          }
           .mobile-back-btn { display: none !important; }

          .chat-area-header {
            padding: 15px 10px;
          }
          .chat-area-header h2 {
            font-size: 16px;
          }
          .messages-container {
            padding: 20px 15px;
          }
          .input-container {
            padding: 15px 10px;
          }
          .input-box {
            padding: 8px 15px;
            gap: 10px;
          }
          .search-bar {
            padding: 6px 10px;
          }
          .icon-btn-small {
            width: 32px;
            height: 32px;
          }
          .message-bubble {
            max-width: 85%;
          }
          .chat-item-header h4 {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="chat-wrapper-component">
        <div className="app-container">
        
        {/* SIDEBAR BACKDROP */}
        {isMobileSidebarOpen && (
           <div className="sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <div className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="icon-btn-small" onClick={() => setShowGroupModal(true)} title="Create Group">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="chat-list">
            {filteredChats.map((chat) => (
              <div 
                key={chat._id} 
                className={`chat-item ${activeChatId === chat._id ? 'active' : ''}`}
                onClick={() => {
                   setActiveChatId(chat._id);
                   setIsMobileSidebarOpen(false);
                }}
              >
                <div className="avatar">
                  {getInitials(getChatName(chat, loggedUser))}
                </div>
                <div className="chat-item-details">
                  <div className="chat-item-header">
                    <h4>{getChatName(chat, loggedUser)}</h4>
                    <span className="chat-item-time">{chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                  </div>
                  <p className="chat-item-msg">{chat.latestMessage ? chat.latestMessage.content : ""}</p>
                  {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="main-chat">
          <div className="chat-area-header">
            <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)} title="Menu">
              <Menu size={24} />
            </button>
            <div className="avatar">{getInitials(getChatName(activeChatDetails, loggedUser))}</div>
            <div>
              <h2>
                {getChatName(activeChatDetails, loggedUser)}
                {activeChatDetails.isGroupChat && <span className="group-badge">Group</span>}
              </h2>
              <p>{activeChatDetails.isGroupChat ? 'Tap here for group info' : 'Online'}</p>
            </div>
            {activeChatDetails.isGroupChat ? (
               <div style={{marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center'}}>
                  <select onChange={(e) => handleAddMember(e.target.value)} style={{background: '#1a1a1a', color: '#fff', padding: '5px', borderRadius: '5px', border: '1px solid #333'}}>
                      <option value="">+ Add Member</option>
                      {platformUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.userName || u.name || u.email}</option>
                      ))}
                  </select>
                  <button onClick={handleExitGroup} className="icon-btn-small" style={{background: '#331111', borderColor: '#551111'}} title="Exit Group">
                      <LogOut size={16} color="#ff4444" />
                  </button>
               </div>
            ) : (
               <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                  <button onClick={handleDeleteChat} className="icon-btn-small" style={{background: '#331111', borderColor: '#551111'}} title="Delete Chat">
                      <Trash2 size={16} color="#ff4444" />
                  </button>
               </div>
            )}
          </div>

          <div className="messages-container">
            {messages[activeChatId]?.length === 0 ? (
              <div className="empty-state">No messages yet. Send a message to start the conversation!</div>
            ) : (
              messages[activeChatId]?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message-row ${msg.sender}`}
                  onMouseEnter={() => setHoveredMsgId(msg.id)}
                  onMouseLeave={() => { 
                    setHoveredMsgId(null); 
                    // Do not close emoji picker immediately to prevent vanishing bug on pixel gaps
                  }}
                >
                  
                  <div className="message-bubble">
                    {/* Hover Actions */}
                    {(hoveredMsgId === msg.id || showEmojiPicker === msg.id) && (
                      <div className="message-hover-actions">
                        <Smile size={16} className="action-icon" onClick={() => setShowEmojiPicker(msg.id)} />
                        {msg.sender === "me" && (
                          <Edit2 size={16} className="action-icon" onClick={() => {
                            setInputValue(msg.text);
                            setEditingMsgId(msg.id);
                          }} />
                        )}
                        
                        {/* Emoji Picker Popup */}
                        {showEmojiPicker === msg.id && (
                          <div className="emoji-picker" onMouseLeave={() => setShowEmojiPicker(null)}>
                            {emojis.map(emoji => (
                              <span key={emoji} onClick={() => handleReaction(msg.id, emoji)}>{emoji}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Display */}
                    {msg.sender === "other" && activeChatDetails?.isGroupChat && (
                      <div style={{ fontSize: '11px', color: '#ff4444', fontWeight: 'bold', marginBottom: '4px', textTransform: 'capitalize' }}>
                        {msg.senderName}
                      </div>
                    )}
                    {msg.type === 'image' && (
                      <div className="attachment-preview">
                        <img src={msg.url} alt="attachment" className="attachment-img" />
                      </div>
                    )}
                    {msg.type === 'file' && (
                      <div className="attachment-preview">
                        <div className="attachment-file">
                          <FileText size={24} color="#d32f2f" />
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    )}
                    
                    {msg.type === 'text' && msg.text}

                    <span className="msg-time">
                      {msg.isEdited && <span className="is-edited">(edited)</span>}
                      {msg.time}
                      {msg.sender === "me" && (
                        /* Blue ticks implementation */
                        <CheckCheck size={14} style={{ color: msg.status === "read" ? "#34B7F1" : "#888" }} />
                      )}
                    </span>

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="reactions-container">
                        {msg.reactions.map((emoji, idx) => (
                          <span key={idx}>{emoji}</span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="input-container" onSubmit={handleSendMessage}>
            {editingMsgId && (
              <div className="editing-indicator">
                <span>Editing message...</span>
                <button type="button" onClick={() => { setEditingMsgId(null); setInputValue(''); }}><X size={14}/></button>
              </div>
            )}
            <div className="input-box">
              <button type="button" className="icon-btn"><Smile size={20} /></button>
              <input 
                type="text" 
                placeholder="Write your message here..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <button 
                type="button" 
                className="icon-btn" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={20} />
              </button>
              
              <button type="button" className="icon-btn"><Mic size={20} /></button>
              <button type="submit" className="send-btn" disabled={!inputValue.trim() && !editingMsgId && fileInputRef.current?.files?.length === 0}>
                <Send size={16} style={{ marginLeft: '-2px' }} />
              </button>
            </div>
          </form>
        </div>

        {/* Custom Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
              <h3 style={{ color: '#ff4444', marginBottom: '15px' }}>Warning</h3>
              <p style={{ color: '#ccc', marginBottom: '25px', fontSize: '15px' }}>{confirmModal.text}</p>
              
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-cancel" onClick={() => setConfirmModal({ isOpen: false, text: "", onConfirm: null })}>Cancel</button>
                <button type="button" className="btn-create" style={{ background: '#ff001f' }} onClick={confirmModal.onConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Group Creation Modal */}
        {showGroupModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Create New Group</h3>
              <form onSubmit={handleCreateGroup}>
                <input 
                  type="text" 
                  placeholder="Group Name" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  style={{ width: '100%', background: '#0a0a0a', border: '1px solid #333', padding: '12px', borderRadius: '8px', color: '#fff', marginBottom: '20px', outline: 'none' }}
                />
                
                <div style={{maxHeight:'200px', overflowY:'auto', background: '#0a0a0a', padding:'10px', borderRadius:'8px', marginBottom: '20px', border: '1px solid #333'}}>
                   <h4 style={{fontSize:'12px', color:'#888', marginBottom:'10px', textTransform:'uppercase'}}>Select Members:</h4>
                   {platformUsers.filter(u => u._id !== loggedUser._id).map(u => (
                       <label key={u._id} style={{display:'flex', alignItems:'center', gap:'10px', color:'#ccc', marginBottom:'8px', cursor:'pointer', fontSize:'13px'}}>
                          <input 
                             type="checkbox" 
                             checked={selectedUsers.some(su => su._id === u._id)}
                             onChange={(e) => {
                                 if(e.target.checked) setSelectedUsers(prev => [...prev, u]);
                                 else setSelectedUsers(prev => prev.filter(su => su._id !== u._id));
                             }}
                             style={{accentColor: '#d32f2f'}}
                          />
                          {u.userName || u.name || u.email}
                       </label>
                   ))}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowGroupModal(false)}>Cancel</button>
                  <button type="submit" className="btn-create" disabled={!newGroupName.trim()}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdvancedChat;