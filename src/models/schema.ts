import { mysqlTable, varchar, int, timestamp, text, bigint, index } from 'drizzle-orm/mysql-core';

// Users table
export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  encryptedPassword: varchar('encrypted_password', { length: 255 }).notNull(),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordSentAt: timestamp('reset_password_sent_at'),
  rememberCreatedAt: timestamp('remember_created_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// JWT Denylist table
export const jwtDenylist = mysqlTable('jwt_denylists', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  jti: varchar('jti', { length: 255 }).notNull(),
  exp: timestamp('exp').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Articles table
export const articles = mysqlTable('articles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }),
  shortDescription: varchar('short_description', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Comments table
export const comments = mysqlTable('comments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  content: text('content'),
  articleId: bigint('article_id', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Likes table
export const likes = mysqlTable('likes', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  likes: int('likes'),
  dislikes: int('dislikes'),
  likeableType: varchar('likeable_type', { length: 255 }).notNull(),
  likeableId: bigint('likeable_id', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Indexes
export const jwtDenylistIndexes = {
  jtiIdx: index('index_jwt_denylists_on_jti').on(jwtDenylist.jti),
};

export const commentsIndexes = {
  articleIdIdx: index('index_comments_on_article_id').on(comments.articleId),
};

export const likesIndexes = {
  likeableIdx: index('index_likes_on_likeable').on(likes.likeableType, likes.likeableId),
};
