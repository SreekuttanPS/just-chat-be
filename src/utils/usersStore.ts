import { User } from "../types";

let users: User[] = [];

export const userStore = {
  add(socketId: string, username: string, name: string) {
    const exists = users.some((user) => user.socketId === socketId);
    if (!exists) {
      users.push({ socketId, username, name });
    }
  },

  remove(socketId: string) {
    users = users.filter((user) => user.socketId !== socketId);
  },

  getAll(): User[] {
    return users;
  },

  getByUsername(username: string): User | undefined {
    return users.find((u) => u?.username === username);
  },

  getBySocket(socketId: string): User | undefined {
    return users.find((u) => u?.socketId === socketId);
  },
};
