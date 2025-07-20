import { Server as SocketIOServer } from 'socket.io';

// Store Socket.IO instance (will be set by the main socket handler)
let io: SocketIOServer | null = null;

// Store active connections
const connections = new Map<string, any>();

export function setSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

// Socket.IO setup for Instagram real-time messaging
export function setupInstagramSocket(io: SocketIOServer) {
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
        connections.set(socket.id, {
          accessToken,
          userId,
          pageId,
          socket
        });

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
        const connection = connections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Send message via Instagram Graph API
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${connection.pageId}/messages`,
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
              access_token: connection.accessToken,
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

        console.log(`Message sent to ${recipientId}: ${message}`);
      } catch (error) {
        console.error('Error sending Instagram message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle media upload
    socket.on('upload_media', async (data) => {
      try {
        const { file, mediaType } = data;
        const connection = connections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Upload media to Instagram
        const formData = new FormData();
        formData.append('source', file);
        formData.append('access_token', connection.accessToken);

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

        console.log(`Media uploaded: ${result.id}`);
      } catch (error) {
        console.error('Error uploading media:', error);
        socket.emit('error', { message: 'Failed to upload media' });
      }
    });

    // Handle webhook events (for incoming messages)
    socket.on('webhook_event', async (data) => {
      try {
        const { event } = data;
        const connection = connections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Process webhook event
        if (event.object === 'instagram' && event.entry) {
          for (const entry of event.entry) {
            if (entry.messaging) {
              for (const messaging of entry.messaging) {
                const message = {
                  id: messaging.message?.mid || Date.now().toString(),
                  from: messaging.sender.id,
                  to: messaging.recipient.id,
                  text: messaging.message?.text || '',
                  timestamp: new Date(messaging.timestamp * 1000),
                  type: messaging.message?.attachments?.[0]?.type || 'text',
                  media_url: messaging.message?.attachments?.[0]?.payload?.url,
                  is_from_me: false,
                  status: 'delivered',
                };

                // Emit to all connected clients
                instagramNamespace.emit('new_message', message);
                console.log(`New Instagram message: ${message.text}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing webhook event:', error);
        socket.emit('error', { message: 'Failed to process webhook event' });
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
        const connection = connections.get(socket.id);

        if (!connection) {
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
              access_token: connection.accessToken,
            }),
          }
        );

        if (response.ok) {
          socket.emit('message_read', { messageId, status: 'read' });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Instagram client disconnected:', socket.id);
      connections.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Instagram socket error:', error);
    });
  });

  return instagramNamespace;
} 