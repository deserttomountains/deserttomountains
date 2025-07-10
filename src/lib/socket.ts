import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
// import whatsappService from '@/services/whatsappService'; // TEMPORARILY COMMENTED OUT FOR BUILD: No such module yet, will implement later

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up socket');
  const io = new SocketIOServer(res.socket.server);
  res.socket.server.io = io;

  // WhatsApp event listeners
  // whatsappService.onStatus((status) => {
  //   io.emit('whatsapp:status', { status });
  // });

  // whatsappService.onMessage((message) => {
  //   io.emit('whatsapp:message', { message });
  // });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // socket.on('whatsapp:connect', async () => {
    //   try {
    //     await whatsappService.connect();
    //     socket.emit('whatsapp:status', { status: 'connecting' });
    //   } catch (error) {
    //     socket.emit('whatsapp:error', { error: 'Failed to connect' });
    //   }
    // });

    // socket.on('whatsapp:disconnect', async () => {
    //   try {
    //     await whatsappService.disconnect();
    //     socket.emit('whatsapp:status', { status: 'disconnected' });
    //   } catch (error) {
    //     socket.emit('whatsapp:error', { error: 'Failed to disconnect' });
    //   }
    // });

    // socket.on('whatsapp:send', async ({ chatId, message }) => {
    //   try {
    //     const sentMessage = await whatsappService.sendMessage(chatId, message);
    //     socket.emit('whatsapp:message:sent', { message: sentMessage });
    //   } catch (error) {
    //     socket.emit('whatsapp:error', { error: 'Failed to send message' });
    //   }
    // });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  res.end();
};

export default SocketHandler; 