import { io } from 'socket.io-client';

let socket;

export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem('token');
        socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
    }
    return socket;
}