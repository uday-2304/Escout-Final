import {io} from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://escout-final.onrender.com";

export function connectWS() {
     return io(API_BASE_URL);
}