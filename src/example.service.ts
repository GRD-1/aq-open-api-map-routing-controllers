import { User, UserAttributes } from './database/models/user';
import { CreationAttributes } from 'sequelize';
import { ApiError, NotFoundError, ValidationError, ConflictError } from './errors/api.error';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';

export class ExampleService {
  static async getAllItems() {
    try {
      return await User.findAll();
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch users', error);
    }
  }

  static async getItemById(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
  }

  static async createItem(data: CreationAttributes<User>) {
    try {
      return await User.create(data);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictError('User with this email already exists');
      }
      if (error instanceof SequelizeValidationError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw new ApiError(500, 'Failed to create user', error);
    }
  }

  static async updateItem(id: number, data: Partial<Omit<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'last_login_at'>>) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      return await user.update(data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw new ConflictError('User with this email already exists');
      }
      if (error instanceof SequelizeValidationError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw new ApiError(500, 'Failed to update user', error);
    }
  }

  static async deleteItem(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    await user.destroy();
    return { success: true };
  }
}

export default new ExampleService();