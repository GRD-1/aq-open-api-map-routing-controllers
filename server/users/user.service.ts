import { User } from '../database/models/user.model';
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes } from './dto';
import { ConflictError, ValidationError, ApiError, NotFoundError, UnauthorizedError } from '../errors/api.error';
import { v4 as uuidv4 } from 'uuid';
import { Optional } from 'sequelize';
import { CreateUsersBulkDtoReq } from './dto/create-users.dto';
import { Op } from 'sequelize';
export default class UserService {
  static async getAllItems(args: { name?: string, email?: string }): Promise<GetUsersDtoRes[]> {
    const { name, email } = args;

    try {
      const users = await User.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`
          },
          email: {
            [Op.like]: `%${email}%`
          }
        }
      });

      return users.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
    } catch (error) {
      throw new ApiError(500, 'Failed to get users', error);
    }
  }

  static async getItemById(id: number): Promise<GetUsersDtoRes> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get user', error);
    }
  }

  static async createItem(userData: CreateUserDtoReq): Promise<GetUsersDtoRes> {
    try {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const user = await User.create(userData as Optional<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_login_at'>);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create user', error);
    }
  }

  static async updateItem(id: number, userData: Partial<UpdateUserDtoReq>): Promise<GetUsersDtoRes> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.update(userData);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update user', error);
    }
  }

  static async deleteItem(id: number): Promise<boolean> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.destroy();
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete user', error);
    }
  }

  static async createBulkItems(users: CreateUserDtoReq[]): Promise<GetUsersDtoRes[]> {
    try {
      const createdUsers = await User.bulkCreate(
        users.map(user => user as Optional<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_login_at'>)
      );
      return createdUsers.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
    } catch (error) {
      throw new ApiError(500, 'Failed to create users', error);
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      throw new ApiError(404, 'Failed to find user by email', error);
    }
  }

  static async login(email: string, password_hash: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.password_hash !== password_hash) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const access_token = uuidv4();
      const refresh_token = uuidv4();
      const expires_in = 6 * 30 * 24 * 60 * 60; // 6 months in seconds

      // Update last login time
      await user.update({ last_login_at: new Date() });

      return {
        access_token,
        refresh_token,
        expires_in
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to login', error);
    }
  }
}