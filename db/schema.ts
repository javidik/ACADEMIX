import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  boolean,
  int,
  decimal,
} from "drizzle-orm/mysql-core";

// ── OAuth users ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  generationsLeft: int("generationsLeft").default(3).notNull(),
  plan: mysqlEnum("plan", ["free", "basic", "pro"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Local users (email/password) ──
export const localUsers = mysqlTable("localUsers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  generationsLeft: int("generationsLeft").default(3).notNull(),
  plan: mysqlEnum("plan", ["free", "basic", "pro"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ── Articles ──
export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  authType: mysqlEnum("authType", ["oauth", "local"]).default("oauth").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  articleType: varchar("articleType", { length: 100 }).notNull(),
  volume: int("volume").notNull(),
  uniqueness: int("uniqueness").notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  content: text("content").notNull(),
  editedContent: text("editedContent"),
  hasTableOfContents: boolean("hasTableOfContents").default(false).notNull(),
  hasBibliography: boolean("hasBibliography").default(false).notNull(),
  colorTag: varchar("colorTag", { length: 20 }).default("#BBDEFB").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ── Article Sources (for citation & highlighting) ──
export const articleSources = mysqlTable("articleSources", {
  id: serial("id").primaryKey(),
  articleId: bigint("articleId", { mode: "number", unsigned: true }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  credibility: int("credibility").default(80).notNull(),
  color: varchar("color", { length: 20 }).default("#BBDEFB").notNull(),
  snippetStart: int("snippetStart").default(0).notNull(),
  snippetEnd: int("snippetEnd").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleSource = typeof articleSources.$inferSelect;

// ── Chat Messages ──
export const chatMessages = mysqlTable("chatMessages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  authType: mysqlEnum("authType", ["oauth", "local"]).default("oauth").notNull(),
  articleId: bigint("articleId", { mode: "number", unsigned: true }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// ── Payments ──
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  authType: mysqlEnum("authType", ["oauth", "local"]).default("oauth").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("RUB").notNull(),
  plan: mysqlEnum("plan", ["free", "basic", "pro"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  method: varchar("method", { length: 50 }).default("card").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;

// ── Templates ──
export const articleTemplates = mysqlTable("articleTemplates", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  articleType: varchar("articleType", { length: 100 }).notNull(),
  volume: int("volume").notNull(),
  uniqueness: int("uniqueness").notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  hasTableOfContents: boolean("hasTableOfContents").default(false).notNull(),
  hasBibliography: boolean("hasBibliography").default(false).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleTemplate = typeof articleTemplates.$inferSelect;
export type InsertArticleTemplate = typeof articleTemplates.$inferInsert;
