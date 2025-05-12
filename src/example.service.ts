import { User } from './database/models/user.model';
import { ApiError, ValidationError, NotFoundError, ConflictError } from './errors/api.error';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes } from './dto';

export class ExampleService {
  private static toPlainUser(user: User): GetUsersDtoRes {
    const plainUser = user.get({ plain: true });
    return {
      id: plainUser.id,
      email: plainUser.email,
      name: plainUser.name,
      last_login_at: plainUser.last_login_at,
      password_hash: plainUser.password_hash,
      created_at: plainUser.created_at,
      updated_at: plainUser.updated_at
    };
  }

  static async getAllItems(): Promise<GetUsersDtoRes[]> {
    try {
      const users = await User.findAll();
      return users.map(user => this.toPlainUser(user));
    } catch (error) {
      console.error('Error in getAllItems:', error);
      throw new ApiError(500, 'Failed to fetch users', error);
    }
  }

  static async getItemById(id: number): Promise<GetUsersDtoRes> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      return this.toPlainUser(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error in getItemById:', error);
      throw new ApiError(500, 'Failed to fetch user', error);
    }
  }

  static async createItem(data: CreateUserDtoReq): Promise<GetUsersDtoRes> {
    try {
      console.log('\ndata:', data);
      const user = await User.create(data as any); // Type assertion needed due to Sequelize typing limitations
      return this.toPlainUser(user);
    } catch (error: any) {
      console.error('Error in createItem:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw new ConflictError('User with this email already exists');
      }
      if (error instanceof SequelizeValidationError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      
      console.error('Unexpected error in createItem:', {
        error,
        data,
        stack: error?.stack
      });
      
      throw new ApiError(500, 'Failed to create user', {
        message: error?.message || 'Unknown error occurred',
        details: error?.errors || error?.details
      });
    }
  }

  static async updateItem(id: number, data: UpdateUserDtoReq): Promise<GetUsersDtoRes> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }

      await user.update(data as any); // Type assertion needed due to Sequelize typing limitations
      return this.toPlainUser(user);
    } catch (error: any) {
      console.error('Error in updateItem:', error);
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof SequelizeValidationError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw new ApiError(500, 'Failed to update user', error);
    }
  }

  static async deleteItem(id: number): Promise<{ message: string }> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      console.error('Error in deleteItem:', error);
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete user', error);
    }
  }
}

export default new ExampleService();