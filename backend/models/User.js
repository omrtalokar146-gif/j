import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '../data/users.json');

const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';

const loadUsers = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const saveUsers = async (users) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
};

const wrapUser = (user) => ({
  ...user,
  async save() {
    const users = await loadUsers();
    const index = users.findIndex((item) => item.id === this.id);
    if (index === -1) {
      throw new Error('User not found');
    }
    users[index] = { ...this };
    delete users[index].save;
    delete users[index].toObject;
    await saveUsers(users);
    return wrapUser(users[index]);
  },
  toObject() {
    const { save, toObject, ...rest } = this;
    return rest;
  },
});

const matchQuery = (user, query) => {
  if (query.$or && Array.isArray(query.$or)) {
    return query.$or.some((clause) => matchQuery(user, clause));
  }
  return Object.entries(query).every(([key, value]) => user[key] === value);
};

const User = {
  async create(data) {
    const users = await loadUsers();
    const user = {
      id: randomUUID(),
      username: data.username,
      email: data.email,
      password: data.password,
      avatarUrl: data.avatarUrl || defaultAvatar,
      avatarPublicId: data.avatarPublicId || '',
      xp: data.xp || 0,
      level: data.level || 1,
      badges: Array.isArray(data.badges) ? data.badges : [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await saveUsers(users);
    return wrapUser(user);
  },

  async findOne(query) {
    const users = await loadUsers();
    const found = users.find((user) => matchQuery(user, query));
    return found ? wrapUser(found) : null;
  },

  async findById(id) {
    const users = await loadUsers();
    const found = users.find((user) => user.id === id);
    return found ? wrapUser(found) : null;
  },
};

export default User;
