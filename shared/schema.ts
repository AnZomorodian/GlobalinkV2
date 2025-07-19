import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  department: varchar("department"),
  bio: text("bio"),
  companyName: varchar("company_name"),
  jobTitle: varchar("job_title"),
  location: varchar("location"),
  status: varchar("status").default("offline"), // online, offline, away, busy
  zinCode: varchar("zin_code", { length: 12 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contactId: varchar("contact_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, file, image
  fileUrl: varchar("file_url"),
  replyToId: integer("reply_to_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  callerId: varchar("caller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  callType: varchar("call_type").notNull(), // voice, video
  status: varchar("status").notNull(), // initiated, answered, ended, missed
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdById: varchar("created_by_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isPrivate: boolean("is_private").default(false),
  maxMembers: integer("max_members").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role").default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, file, image
  fileUrl: varchar("file_url"),
  replyToId: integer("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  contacts: many(contacts, { relationName: "userContacts" }),
  contactedBy: many(contacts, { relationName: "contactedBy" }),
  initiatedCalls: many(calls, { relationName: "initiatedCalls" }),
  receivedCalls: many(calls, { relationName: "receivedCalls" }),
  createdGroups: many(groups, { relationName: "createdGroups" }),
  groupMemberships: many(groupMembers, { relationName: "groupMemberships" }),
  sentGroupMessages: many(groupMessages, { relationName: "sentGroupMessages" }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: "messageReplies",
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
    relationName: "userContacts",
  }),
  contact: one(users, {
    fields: [contacts.contactId],
    references: [users.id],
    relationName: "contactedBy",
  }),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  caller: one(users, {
    fields: [calls.callerId],
    references: [users.id],
    relationName: "initiatedCalls",
  }),
  receiver: one(users, {
    fields: [calls.receiverId],
    references: [users.id],
    relationName: "receivedCalls",
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [groups.createdById],
    references: [users.id],
    relationName: "createdGroups",
  }),
  members: many(groupMembers),
  messages: many(groupMessages),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
    relationName: "groupMemberships",
  }),
}));

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  group: one(groups, {
    fields: [groupMessages.groupId],
    references: [groups.id],
  }),
  sender: one(users, {
    fields: [groupMessages.senderId],
    references: [users.id],
    relationName: "sentGroupMessages",
  }),
  replyTo: one(groupMessages, {
    fields: [groupMessages.replyToId],
    references: [groupMessages.id],
    relationName: "groupMessageReplies",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
  endedAt: true,
  duration: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type GroupMessage = typeof groupMessages.$inferSelect;
