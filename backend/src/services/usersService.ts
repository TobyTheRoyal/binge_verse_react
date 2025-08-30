import { UserModel, UserDocument } from '../models/user';

export class UsersService {
  async create(data: { username: string; email: string; password: string }): Promise<UserDocument> {
    const user = new UserModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return UserModel.findOne({ username }).exec();
  }

  async findById(id: number): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }
}