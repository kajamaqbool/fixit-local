import { io } from 'socket.io-client';

let socket;

export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem('token');
        socket = io('http://localhost:5000', { auth: { token } });
    }
    return socket;
}