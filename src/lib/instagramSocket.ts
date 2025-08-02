import { Server as SocketIOServer } from 'socket.io';

// Get Socket.IO instance from the main server
let io: SocketIOServer | null = null;

// This function will be called by the main socket server to set the io instance
export function setWebhookSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

// Function to get the current Socket.IO instance
export function getSocketIO(): SocketIOServer | null {
  return io;
}

// Function to emit Instagram events
export function emitInstagramEvent(event: string, data: any) {
  if (io) {
    io.of('/instagram').emit(event, data);
    console.log(`Instagram event emitted: ${event}`);
  } else {
    console.log('Socket.IO instance not available for Instagram events');
  }
} 