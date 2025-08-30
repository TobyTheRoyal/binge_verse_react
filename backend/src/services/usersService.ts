export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  async create(data: { username: string; email: string; password: string }): Promise<User> {
    const user: User = { id: this.idCounter++, ...data };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
}