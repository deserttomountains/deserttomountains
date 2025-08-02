import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { setWebhookSocketIO } from '@/lib/instagramSocket';
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
  const io = new SocketIOServer(res.socket.server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  res.socket.server.io = io;

  // Setup Instagram WebSocket
  setupInstagramSocket(io);
  
  // Set the Socket.IO instance for the webhook
  setWebhookSocketIO(io);

  // WhatsApp event listeners
  // whatsappService.onStatus((status) => {
  //   io.emit('whatsapp:status', { status });
  // });

  // whatsappService.onMessage((message) => {
  //   io.emit('whatsapp:message', { message });
  // });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

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
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
};

// Instagram Socket.IO setup
function setupInstagramSocket(io: SocketIOServer) {
  const instagramNamespace = io.of('/instagram');

  instagramNamespace.on('connection', (socket) => {
    console.log('Instagram client connected:', socket.id);

    // Authenticate the connection
    socket.on('authenticate', async (data) => {
      try {
        const { accessToken, userId, pageId } = data;
        
        if (!accessToken || !userId) {
          socket.emit('error', { message: 'Authentication failed: Missing credentials' });
          return;
        }

        // Store connection info
        socket.data = {
          accessToken,
          userId,
          pageId,
          authenticated: true
        };

        socket.emit('authenticated', { 
          status: 'connected',
          message: 'Instagram WebSocket authenticated successfully'
        });

        console.log(`Instagram client authenticated: ${userId}`);
      } catch (error) {
        console.error('Instagram authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, message, messageType, mediaUrl } = data;
        
        if (!socket.data?.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Send message via Instagram Graph API
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${socket.data.pageId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: { id: recipientId },
              message: messageType === 'text' ? { text: message } : {
                attachment: {
                  type: messageType,
                  payload: { url: mediaUrl }
                }
              },
              access_token: socket.data.accessToken,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Emit success event
        socket.emit('message_sent', {
          messageId: result.message_id,
          recipientId,
          status: 'sent'
        });

        console.log(`Instagram message sent to ${recipientId}: ${message}`);
      } catch (error) {
        console.error('Error sending Instagram message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle media upload
    socket.on('upload_media', async (data) => {
      try {
        const { file, mediaType } = data;
        
        if (!socket.data?.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Upload media to Instagram
        const formData = new FormData();
        formData.append('source', file);
        formData.append('access_token', socket.data.accessToken);

        const response = await fetch(
          `https://graph.facebook.com/v18.0/me/photos`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload media: ${response.statusText}`);
        }

        const result = await response.json();
        
        socket.emit('media_uploaded', {
          mediaId: result.id,
          mediaUrl: result.url,
          status: 'success'
        });

        console.log(`Instagram media uploaded: ${result.id}`);
      } catch (error) {
        console.error('Error uploading Instagram media:', error);
        socket.emit('error', { message: 'Failed to upload media' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { recipientId } = data;
      instagramNamespace.emit('typing_start', { recipientId });
    });

    socket.on('typing_stop', (data) => {
      const { recipientId } = data;
      instagramNamespace.emit('typing_stop', { recipientId });
    });

    // Handle read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        
        if (!socket.data?.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Mark message as read via Instagram Graph API
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${messageId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: 'read',
              access_token: socket.data.accessToken,
            }),
          }
        );

        if (response.ok) {
          socket.emit('message_read', { messageId, status: 'read' });
        }
      } catch (error) {
        console.error('Error marking Instagram message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Instagram client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Instagram socket error:', error);
    });
  });

  return instagramNamespace;
}

export default SocketHandler; 