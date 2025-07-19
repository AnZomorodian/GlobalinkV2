import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContactSchema, insertMessageSchema, insertCallSchema, insertGroupSchema, insertGroupMemberSchema, insertGroupMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  userId?: string;
}

const connectedClients = new Map<string, WebSocketClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      const userId = req.user.claims.sub;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }

      const users = await storage.searchUsers(q, userId);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Get discoverable users for enhanced add contact (must come before the :userId route)
  app.get('/api/users/discoverable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const users = await storage.getDiscoverableUsers(userId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching discoverable users:", error);
      res.status(500).json({ message: "Failed to fetch discoverable users" });
    }
  });

  // Get user by ID route
  app.get('/api/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add profile update route
  app.put('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.put('/api/users/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      if (!status || !['online', 'offline', 'away', 'busy'].includes(status)) {
        return res.status(400).json({ message: "Valid status required" });
      }

      await storage.updateUserStatus(userId, status);
      
      // Broadcast status update to connected clients
      connectedClients.forEach((client, clientId) => {
        if (client.readyState === WebSocket.OPEN && clientId !== userId) {
          client.send(JSON.stringify({
            type: 'statusUpdate',
            userId,
            status,
          }));
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Contact routes
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertContactSchema.parse({
        ...req.body,
        userId,
      });

      const contact = await storage.addContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Failed to add contact" });
    }
  });

  app.delete('/api/contacts/:contactId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.params;
      
      await storage.removeContact(userId, contactId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing contact:", error);
      res.status(500).json({ message: "Failed to remove contact" });
    }
  });

  app.put('/api/contacts/:contactId/block', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.params;
      
      await storage.blockContact(userId, contactId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error blocking contact:", error);
      res.status(500).json({ message: "Failed to block contact" });
    }
  });

  app.put('/api/contacts/:contactId/unblock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.params;
      
      await storage.unblockContact(userId, contactId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unblocking contact:", error);
      res.status(500).json({ message: "Failed to unblock contact" });
    }
  });

  // Message routes
  app.get('/api/messages/:contactId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.params;
      const { limit } = req.query;
      
      const messages = await storage.getMessages(userId, contactId, limit ? parseInt(limit) : undefined);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.sendMessage(messageData);
      
      // Send message to recipient via WebSocket if connected
      const recipientSocket = connectedClients.get(messageData.receiverId);
      if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify({
          type: 'newMessage',
          message,
        }));
      }
      
      // Also send to sender for real-time update
      const senderSocket = connectedClients.get(userId);
      if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
        senderSocket.send(JSON.stringify({
          type: 'messageSent',
          message,
        }));
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getRecentChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });



  // Call routes
  app.post('/api/calls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const callData = insertCallSchema.parse({
        ...req.body,
        callerId: userId,
        status: 'initiated',
      });

      const call = await storage.createCall(callData);
      
      // Notify recipient via WebSocket
      const recipientSocket = connectedClients.get(callData.receiverId);
      if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify({
          type: 'incomingCall',
          call,
        }));
      }
      
      res.json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid call data", errors: error.errors });
      }
      console.error("Error creating call:", error);
      res.status(500).json({ message: "Failed to create call" });
    }
  });

  app.put('/api/calls/:callId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { callId } = req.params;
      const { status, duration } = req.body;
      
      await storage.updateCallStatus(parseInt(callId), status, duration);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating call status:", error);
      res.status(500).json({ message: "Failed to update call status" });
    }
  });

  // Group routes
  app.post('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupData = insertGroupSchema.parse({
        ...req.body,
        createdById: userId,
      });

      const group = await storage.createGroup(groupData);
      res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups/:groupId/members', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { userId: memberUserId, role = 'member' } = req.body;
      
      const memberData = insertGroupMemberSchema.parse({
        groupId: parseInt(groupId),
        userId: memberUserId,
        role,
      });

      const member = await storage.addGroupMember(memberData);
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      console.error("Error adding group member:", error);
      res.status(500).json({ message: "Failed to add group member" });
    }
  });

  app.get('/api/groups/:groupId/members', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const members = await storage.getGroupMembers(parseInt(groupId));
      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  app.delete('/api/groups/:groupId/members/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId, userId } = req.params;
      await storage.removeGroupMember(parseInt(groupId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing group member:", error);
      res.status(500).json({ message: "Failed to remove group member" });
    }
  });

  app.post('/api/groups/:groupId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      
      const messageData = insertGroupMessageSchema.parse({
        ...req.body,
        groupId: parseInt(groupId),
        senderId: userId,
      });

      const message = await storage.sendGroupMessage(messageData);
      
      // Broadcast to group members
      const members = await storage.getGroupMembers(parseInt(groupId));
      members.forEach(member => {
        const memberSocket = connectedClients.get(member.userId);
        if (memberSocket && memberSocket.readyState === WebSocket.OPEN && member.userId !== userId) {
          memberSocket.send(JSON.stringify({
            type: 'groupMessage',
            message: { ...message, groupId: parseInt(groupId) },
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending group message:", error);
      res.status(500).json({ message: "Failed to send group message" });
    }
  });

  app.get('/api/groups/:groupId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { limit } = req.query;
      
      const messages = await storage.getGroupMessages(
        parseInt(groupId), 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching group messages:", error);
      res.status(500).json({ message: "Failed to fetch group messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'authenticate':
            ws.userId = message.userId;
            connectedClients.set(message.userId, ws);
            await storage.updateUserStatus(message.userId, 'online');
            
            // Broadcast status update
            connectedClients.forEach((client, clientId) => {
              if (client.readyState === WebSocket.OPEN && clientId !== message.userId) {
                client.send(JSON.stringify({
                  type: 'statusUpdate',
                  userId: message.userId,
                  status: 'online',
                }));
              }
            });
            break;

          case 'webrtc-offer':
          case 'webrtc-answer':
          case 'webrtc-ice-candidate':
          case 'webrtc-end-call':
            // Forward WebRTC signaling messages
            const targetSocket = connectedClients.get(message.targetUserId);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                ...message,
                fromUserId: ws.userId,
              }));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket client disconnected');
      if (ws.userId) {
        connectedClients.delete(ws.userId);
        await storage.updateUserStatus(ws.userId, 'offline');
        
        // Broadcast status update
        connectedClients.forEach((client, clientId) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'statusUpdate',
              userId: ws.userId,
              status: 'offline',
            }));
          }
        });
      }
    });
  });

  return httpServer;
}
