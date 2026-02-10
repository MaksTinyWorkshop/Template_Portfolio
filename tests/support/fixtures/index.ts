import { test as base, expect } from "@playwright/test";
import { createUser, createUsers, User } from "./factories/user.factory";

type UserFactoryFixture = {
  create: (overrides?: Partial<User>) => User;
  createMany: (count: number, overrides?: Partial<User>) => User[];
};

export const test = base.extend<{ userFactory: UserFactoryFixture }>({
  userFactory: async ({}, use) => {
    const created: User[] = [];

    await use({
      create: (overrides?: Partial<User>) => {
        const user = createUser(overrides);
        created.push(user);
        return user;
      },
      createMany: (count: number, overrides?: Partial<User>) => {
        const users = createUsers(count, overrides);
        created.push(...users);
        return users;
      },
    });

    if (created.length) {
      console.log("Nettoyage simulé pour", created.length, "utilisateurs.");
    }
  },
});

export { expect };
export type { User };
export const userFactory = { createUser, createUsers };
