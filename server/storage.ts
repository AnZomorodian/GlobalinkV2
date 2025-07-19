import {
  users,
  contacts,
  messages,
  calls,
  type User,
  type UpsertUser,
  type InsertContact,
  type Contact,
  type InsertMessage,
  type Message,
  type InsertCall,
  type Call,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, not } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Additional user operations
  searchUsers(query: string, currentUserId: string): Promise<User[]>;
  updateUserStatus(userId: string, status: string): Promise<void>;
  getDiscoverableUsers(currentUserId: string): Promise<User[]>;
  
  // Contact operations
  addContact(contact: InsertContact): Promise<Contact>;
  getContacts(userId: string): Promise<(Contact & { contact: User })[]>;
  removeContact(userId: string, contactId: string): Promise<void>;
  blockContact(userId: string, contactId: string): Promise<void>;
  unblockContact(userId: string, contactId: string): Promise<void>;
  isContactBlocked(userId: string, contactId: string): Promise<boolean>;
  
  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId: string, contactId: string, limit?: number): Promise<(Message & { sender: User, receiver: User })[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getRecentChats(userId: string): Promise<any[]>;
  
  // Call operations
  createCall(call: InsertCall): Promise<Call>;
  updateCallStatus(callId: number, status: string, duration?: number): Promise<void>;
  getCallHistory(userId: string): Promise<(Call & { caller: User, receiver: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Additional user operations
  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          not(eq(users.id, currentUserId)),
          or(
            like(users.id, `%${query}%`),
            like(users.firstName, `%${query}%`),
            like(users.lastName, `%${query}%`),
            like(users.email, `%${query}%`)
          )
        )
      )
      .limit(10);
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Contact operations
  async addContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts(userId: string): Promise<(Contact & { contact: User })[]> {
    return await db
      .select({
        id: contacts.id,
        userId: contacts.userId,
        contactId: contacts.contactId,
        isBlocked: contacts.isBlocked,
        createdAt: contacts.createdAt,
        contact: users,
      })
      .from(contacts)
      .innerJoin(users, eq(contacts.contactId, users.id))
      .where(eq(contacts.userId, userId))
      .orderBy(asc(users.firstName));
  }

  async removeContact(userId: string, contactId: string): Promise<void> {
    await db
      .delete(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contacts.contactId, contactId)
        )
      );
  }

  async blockContact(userId: string, contactId: string): Promise<void> {
    await db
      .update(contacts)
      .set({ isBlocked: true })
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contacts.contactId, contactId)
        )
      );
  }

  async unblockContact(userId: string, contactId: string): Promise<void> {
    await db
      .update(contacts)
      .set({ isBlocked: false })
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contacts.contactId, contactId)
        )
      );
  }

  async isContactBlocked(userId: string, contactId: string): Promise<boolean> {
    const [contact] = await db
      .select({ isBlocked: contacts.isBlocked })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contacts.contactId, contactId)
        )
      );
    return contact?.isBlocked || false;
  }

  // Message operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessages(userId: string, contactId: string, limit = 50): Promise<(Message & { sender: User, receiver: User, replyTo?: Message & { sender: User } })[]> {
    const messageList = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        messageType: messages.messageType,
        fileUrl: messages.fileUrl,
        replyToId: messages.replyToId,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, contactId)),
            and(eq(messages.senderId, contactId), eq(messages.receiverId, userId))
          )
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // Get sender, receiver, and reply details for each message
    const enrichedMessages = await Promise.all(
      messageList.map(async (message) => {
        const [sender] = await db.select().from(users).where(eq(users.id, message.senderId));
        const [receiver] = await db.select().from(users).where(eq(users.id, message.receiverId));
        
        let replyTo = null;
        if (message.replyToId) {
          const [replyMessage] = await db.select().from(messages).where(eq(messages.id, message.replyToId));
          if (replyMessage) {
            const [replySender] = await db.select().from(users).where(eq(users.id, replyMessage.senderId));
            replyTo = {
              ...replyMessage,
              sender: replySender,
              senderName: replySender ? `${replySender.firstName || ''} ${replySender.lastName || ''}`.trim() || replySender.email : 'Unknown User'
            };
          }
        }
        
        return {
          ...message,
          sender: sender || null,
          receiver: receiver || null,
          replyTo
        };
      })
    );

    return enrichedMessages.filter(msg => msg.sender && msg.receiver) as (Message & { sender: User, receiver: User, replyTo?: Message & { sender: User } })[];
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  async getRecentChats(userId: string): Promise<any[]> {
    // Get most recent message for each contact
    const recentMessages = await db
      .select({
        contactId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.createdAt));

    const sentMessages = await db
      .select({
        contactId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(eq(messages.senderId, userId))
      .orderBy(desc(messages.createdAt));

    // Combine and get unique contacts with their latest messages
    const allMessages = [...recentMessages, ...sentMessages];
    const contactMap = new Map();

    for (const msg of allMessages) {
      if (!contactMap.has(msg.contactId) || (contactMap.get(msg.contactId).createdAt && msg.createdAt && contactMap.get(msg.contactId).createdAt < msg.createdAt)) {
        contactMap.set(msg.contactId, msg);
      }
    }

    // Get user details for each contact
    const contactIds = Array.from(contactMap.keys());
    let contactUsers = [];
    
    if (contactIds.length > 0) {
      contactUsers = await db
        .select()
        .from(users)
        .where(or(...contactIds.map(id => eq(users.id, id))));
    }

    // Get recently active users (for auto-discovery)
    const recentlyActiveUsers = await db
      .select()
      .from(users)
      .where(not(eq(users.id, userId)))
      .orderBy(desc(users.updatedAt))
      .limit(5);

    // Combine message-based chats with recently active users
    const chatsWithMessages = contactUsers.map(user => ({
      ...user,
      lastMessage: contactMap.get(user.id),
    }));

    // Add recently active users that don't have messages yet
    const existingContactIds = new Set(contactIds);
    const newDiscoveredUsers = recentlyActiveUsers
      .filter(user => !existingContactIds.has(user.id))
      .map(user => ({
        ...user,
        lastMessage: null,
      }));

    return [...chatsWithMessages, ...newDiscoveredUsers];
  }

  // Add method to get all discoverable users for enhanced add contact
  async getDiscoverableUsers(currentUserId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(not(eq(users.id, currentUserId)))
      .orderBy(desc(users.updatedAt))
      .limit(20);
  }

  // Call operations
  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db
      .insert(calls)
      .values(call)
      .returning();
    return newCall;
  }

  async updateCallStatus(callId: number, status: string, duration?: number): Promise<void> {
    const updateData: any = { status };
    if (status === "ended" && duration !== undefined) {
      updateData.duration = duration;
      updateData.endedAt = new Date();
    }
    
    await db
      .update(calls)
      .set(updateData)
      .where(eq(calls.id, callId));
  }

  async getCallHistory(userId: string): Promise<(Call & { caller: User, receiver: User })[]> {
    return await db
      .select({
        id: calls.id,
        callerId: calls.callerId,
        receiverId: calls.receiverId,
        callType: calls.callType,
        status: calls.status,
        duration: calls.duration,
        createdAt: calls.createdAt,
        endedAt: calls.endedAt,
        caller: users,
        receiver: users,
      })
      .from(calls)
      .innerJoin(users, eq(calls.callerId, users.id))
      .where(
        or(
          eq(calls.callerId, userId),
          eq(calls.receiverId, userId)
        )
      )
      .orderBy(desc(calls.createdAt))
      .limit(50);
  }
}

export const storage = new DatabaseStorage();
