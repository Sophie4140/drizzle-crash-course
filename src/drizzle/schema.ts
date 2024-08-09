import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  boolean,
  real,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["ADMIN", "BASIC"]);

export const UserTable = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: UserRole("userRole").notNull().default("BASIC"),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex("emailIndex").on(table.email),
      uniqueNameAndAge: unique("uniqueNameAndAge").on(table.name, table.age),
    };
  }
);

export const UserPreferencesTable = pgTable("UserPreferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailUpdate: boolean("emailUpdate").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id),
});

export const PostTable = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  avarageRating: real("avarageRating").notNull().default(0),
  createAt: timestamp("createAt").notNull().defaultNow(),
  updateAt: timestamp("updateAt").notNull().defaultNow(),
  authId: uuid("authId")
    .notNull()
    .references(() => UserTable.id),
});

export const CategoryTable = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const PostCategoryTable = pgTable(
  "postCategory",
  {
    postId: uuid("postId")
      .notNull()
      .references(() => PostTable.id),
    categoryId: uuid("categoryId")
      .notNull()
      .references(() => CategoryTable.id),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.postId, table.categoryId] }) };
  }
);

// RELATIONS

export const UserTableRelations = relations(UserTable, ({ one, many }) => {
  return {
    preferences: one(UserPreferencesTable),
    posts: many(PostTable),
  };
});

export const UserPreferencesTableRelations = relations(UserPreferencesTable, ({ one }) => {
  return {
    user: one(UserTable,{
      fields:[UserPreferencesTable.userId],
      references:[UserTable.id]
    }),
  };
});

export const PostTableRelations = relations(PostTable, ({ one, many }) => {
  return{
    author:one(UserTable,{
      fields:[PostTable.authId],
      references:[UserTable.id]
    }),
    postCategories:many(PostCategoryTable)
  }
});

export const CategoryTableRelations = relations(CategoryTable, ({  many }) => {
  return{
    postCategories:many(PostCategoryTable)
  }
})

export const PostCategoryTableRelations = relations(PostCategoryTable, ({ one }) => {
  return{
    post:one(PostTable,{
      fields:[PostCategoryTable.postId],
      references:[PostTable.id]
    }),
    category:one(CategoryTable,{
      fields:[PostCategoryTable.categoryId],
      references:[CategoryTable.id]
    })
  }
});
