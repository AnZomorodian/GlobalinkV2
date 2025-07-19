import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContactSchema, insertMessageSchema, insertCallSchema, insertGroupSchema, insertGroupMemberSchema, insertGroupMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
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

  // Update group
  app.put('/api/groups/:groupId', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;
      const userId = req.user.claims.sub;

      if (!name?.trim()) {
        return res.status(400).json({ message: "Group name is required" });
      }

      const updatedGroup = await storage.updateGroup(groupId, userId, {
        name: name.trim(),
        description: description?.trim() || ""
      });

      if (!updatedGroup) {
        return res.status(404).json({ message: "Group not found or access denied" });
      }

      res.json(updatedGroup);
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  app.post('/api/groups/:groupId/members', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { email, userId: memberUserId, role = 'member' } = req.body;
      const userId = req.user.claims.sub;
      
      if (email) {
        // Add member by email
        const member = await storage.addGroupMemberByEmail(groupId, userId, email.trim());
        
        if (!member) {
          return res.status(400).json({ message: "User not found or already a member" });
        }
        
        res.json(member);
      } else {
        // Original functionality
        const memberData = insertGroupMemberSchema.parse({
          groupId: parseInt(groupId),
          userId: memberUserId,
          role,
        });

        const member = await storage.addGroupMember(memberData);
        res.json(member);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      console.error("Error adding group member:", error);
      res.status(500).json({ message: "Failed to add group member" });
    }
  });

  // Get group details with members
  app.get('/api/groups/:groupId/details', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.claims.sub;
      
      const groupDetails = await storage.getGroupDetails(groupId, userId);
      
      if (!groupDetails) {
        return res.status(404).json({ message: "Group not found or access denied" });
      }
      
      res.json(groupDetails);
    } catch (error) {
      console.error("Error fetching group details:", error);
      res.status(500).json({ message: "Failed to fetch group details" });
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

  // Remove member from group
  app.delete('/api/groups/:groupId/members/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId, userId: targetUserId } = req.params;
      const userId = req.user.claims.sub;

      const success = await storage.removeGroupMemberByUserId(groupId, userId, targetUserId);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to remove member or access denied" });
      }

      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing group member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  // Update member role
  app.put('/api/groups/:groupId/members/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const userId = req.user.claims.sub;

      if (!['admin', 'member'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const success = await storage.updateGroupMemberRole(groupId, userId, targetUserId, role);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to update role or access denied" });
      }

      res.json({ message: "Role updated successfully" });
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete('/api/groups/:groupId/members/:userId/legacy', isAuthenticated, async (req: any, res) => {
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

  // Enhanced WebSocket with heartbeat and error handling
  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log(`WebSocket client connected from ${req.socket.remoteAddress}`);
    
    // Set up heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: Date.now(),
    }));

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Validate message structure
        if (!message.type) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format: missing type',
          }));
          return;
        }
        
        switch (message.type) {
          case 'ping':
            // Respond to ping with pong
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
            }));
            break;

          case 'authenticate':
            if (!message.userId) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Authentication failed: missing userId',
              }));
              return;
            }
            
            ws.userId = message.userId;
            connectedClients.set(message.userId, ws);
            
            try {
              await storage.updateUserStatus(message.userId, 'online');
              
              // Send authentication success
              ws.send(JSON.stringify({
                type: 'authenticated',
                userId: message.userId,
                timestamp: Date.now(),
              }));
              
              // Broadcast status update to other clients
              const statusUpdate = {
                type: 'statusUpdate',
                userId: message.userId,
                status: 'online',
                timestamp: Date.now(),
              };
              
              connectedClients.forEach((client, clientId) => {
                if (client.readyState === WebSocket.OPEN && clientId !== message.userId) {
                  client.send(JSON.stringify(statusUpdate));
                }
              });
            } catch (error) {
              console.error('Authentication error:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Authentication failed',
              }));
            }
            break;

          case 'typing':
            // Forward typing indicators
            if (message.targetUserId && ws.userId) {
              const targetSocket = connectedClients.get(message.targetUserId);
              if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                targetSocket.send(JSON.stringify({
                  type: 'typing',
                  fromUserId: ws.userId,
                  isTyping: message.isTyping,
                  timestamp: Date.now(),
                }));
              }
            }
            break;

          case 'webrtc-offer':
          case 'webrtc-answer':
          case 'webrtc-ice-candidate':
          case 'webrtc-end-call':
            // Forward WebRTC signaling messages with enhanced error handling
            if (!message.targetUserId) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'WebRTC message missing targetUserId',
              }));
              return;
            }
            
            const targetSocket = connectedClients.get(message.targetUserId);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                ...message,
                fromUserId: ws.userId,
                timestamp: Date.now(),
              }));
            } else {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Target user not connected',
              }));
            }
            break;

          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: `Unknown message type: ${message.type}`,
            }));
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', async (code, reason) => {
      console.log(`WebSocket client disconnected: ${code} - ${reason}`);
      if (ws.userId) {
        connectedClients.delete(ws.userId);
        
        try {
          await storage.updateUserStatus(ws.userId, 'offline');
          
          // Broadcast status update
          const statusUpdate = {
            type: 'statusUpdate',
            userId: ws.userId,
            status: 'offline',
            timestamp: Date.now(),
          };
          
          connectedClients.forEach((client, clientId) => {
            if (client.readyState === WebSocket.OPEN) {
              try {
                client.send(JSON.stringify(statusUpdate));
              } catch (error) {
                console.error('Error broadcasting status update:', error);
              }
            }
          });
        } catch (error) {
          console.error('Error updating user status on disconnect:', error);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (ws.userId) {
        connectedClients.delete(ws.userId);
      }
    });
  });

  // Heartbeat interval to detect broken connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        console.log('Terminating dead WebSocket connection');
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  // Cleanup heartbeat on server close
  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  return httpServer;
}
