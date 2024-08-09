import "dotenv/config";
import { db } from "./drizzle/db";
import { PostTable, UserPreferencesTable, UserTable } from "./drizzle/schema";
import { asc, sql, eq, count, avg, gt, ne } from "drizzle-orm";

async function main() {
  // await deleteTable();
  // await updateTable();
  const users = await db.select().from(UserPreferencesTable);
  console.log(users);
}

const queryEmailAndName = async () => {
  await db.query.UserTable.findMany({
    columns: {
      email: true,
      name: true,
    },
    extras: {
      lowerCaseName: sql<string>`lower(${UserTable.name})`.as("lowerCaseName"),
    },
    limit: 10, // limit the number of rows returned
    offset: 0, // offset the number of rows returned
  });
};

const insertData = async () => {
  const users = await db
    .insert(UserTable)
    .values([
      {
        name: "derek",
        age: 18,
        email: "Derek@test.com",
      },
      // { name: "Buddy", age: 1, email: "buddy@email.com" },
    ])
    .returning({
      id: UserTable.id,
    });
  // .onConflictDoUpdate({
  //   target: UserTable.email,
  //   set: { name: "Updated Name" },
  // });
  console.log(users);
};

const deletTable = async () => {
  await db.delete(UserTable);
};

const queryUsernameAndPerferenceTable = async () => {
  await db.insert(UserPreferencesTable).values({
    emailUpdate: true,
    userId: "3f716d5e-42b7-4623-9bd0-a18d7fd42f3e",
  });
  const users = await db.query.UserTable.findMany({
    columns: { name: true, id: true },
    with: {
      preferences: true,
    },
  });
  console.log(users);
};

const queryUserByPosetAndCategory = async () => {
  // await db.insert(PostTable).values({

  // })
  const users = await db.query.UserTable.findMany({
    columns: { name: true, age: true },
    orderBy: (table, func) => func.asc(table.age),
    // orderBy: asc(UserTable.age),
    // orderBy: (table, {asc}) => asc(table.age),
    where: (table, func) => func.eq(table.age, 18),
    // where: (table, func) => func.between(table.age, 1, 18),
    with: {
      posts: {
        with: {
          postCategories: true,
        },
      },
    },
  });
  console.log(users);
};

const dbSelectByName = async () => {
  const users = await db
    .select({
      name: UserTable.name,
      count: count(UserTable.name),
    })
    .from(UserTable)
    // .where(eq(UserTable.age, 18))
    .groupBy(UserTable.name);

  console.log(users);
};

const dbGroupByAge = async () => {
  const users = await db
    .select({
      age: UserTable.age,
      // avg: avg(UserTable.age),
      count: count(UserTable.age),
    })
    .from(UserTable)
    .groupBy(UserTable.age)
    .having((columns) => gt(columns.count, 1));

  console.log(users);
};

const userTableLeftJoinUserPreferenceTable = async () => {
  const users = await db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      emailUpdate: UserPreferencesTable.emailUpdate,
    })
    .from(UserTable)
    .leftJoin(
      UserPreferencesTable,
      eq(UserTable.id, UserPreferencesTable.userId)
    );
};

const updateTable = async () => {
  const users = await db
    .update(UserTable)
    .set({
      age: 28,
    })
    .where(eq(UserTable.name, "derek"))
    .returning({ id: UserTable.id });
  console.log(users);
};

const deleteTable = async () => {
  await db
    .delete(UserPreferencesTable)
    .where(ne(UserPreferencesTable.id, "9abf287d-fb42-4bba-add7-593616063f1e"));
};

main();
