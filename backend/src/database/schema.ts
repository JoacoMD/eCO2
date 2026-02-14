import { pgTable, serial, text, boolean, timestamp, pgEnum, uuid, numeric } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    name: text('name').unique(),
    description: text('description'),
    image: text('image'),
    website: text('website'),
    address: text('address').notNull(),
    isActive: boolean('is_active').default(true),
});

export const milestones = pgTable('milestones', {
    id: serial('id').primaryKey(),
    projectId: serial('project_id').references(() => projects.id).notNull(),
    title: text('title'),
    url: text('url'),
    isCompleted: boolean('is_completed').default(false),
});

export const companies = pgTable('companies', {
    id: serial('id').primaryKey(),
    name: text('name').unique(),
    industry: text('industry'),
    description: text('description'),
    website: text('website'),
    address: text('address').notNull(),
    isActive: boolean('is_active').default(true),
});

export const tokens = pgTable('tokens', {
    id: serial('id').primaryKey(),
    name: text('name'),
    projectId: serial('project_id').references(() => projects.id).notNull(),
    description: text('description'),
    image: text('image')
}); 

export const statusEnum = pgEnum('auth_message_status', ['pending', 'used', 'expired']); 

export const auth_messages = pgTable('auth_messages', {
    id: uuid('id').primaryKey(),
    address: text('address').unique().notNull(),
    status: statusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    from: text('from').notNull(),
    hash: text('hash').notNull(),
    blockNumber: numeric<"number">('block_number').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    event: text('event').notNull(),
    data: text('data').notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;

export type AuthMessage = typeof auth_messages.$inferSelect;
export type NewAuthMessage = typeof auth_messages.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;