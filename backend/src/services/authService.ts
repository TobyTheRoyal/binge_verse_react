import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsersService } from './usersService';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    try {
      const existingEmail = await this.usersService.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
      const existingUsername = await this.usersService.findByUsername(username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({ username, email, password: hashed });
      const payload = { email: user.email, sub: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h',
      });
      return { access_token: token };
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new Error('Email already exists');
        }
        if (error.keyPattern?.username) {
          throw new Error('Username already exists');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });
    return { access_token: token };
  }
}