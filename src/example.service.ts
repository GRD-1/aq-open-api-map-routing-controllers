import { User } from './database/models/user.model';
import { ApiError, ValidationError, NotFoundError, ConflictError } from './errors/api.error';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';

export class ExampleService {
  private static toPlainUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  static async getAllItems() {
    try {
      const users = await User.findAll();
      return users.map(user => this.toPlainUser(user));
    } catch (error) {
      console.error('Error in getAllItems:', error);
      throw new ApiError(500, 'Failed to fetch users', error);
    }
  }

  static async getItemById(id: number) {
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

  static async createItem(data: any) {
    try {
      console.log('\ndata:', data);
      // Validate required fields
      if (!data.email || !data.password_hash || !data.name) {
        throw new ValidationError('Missing required fields', {
          email: !data.email ? 'Email is required' : undefined,
          password_hash: !data.password_hash ? 'Password hash is required' : undefined,
          name: !data.name ? 'Name is required' : undefined
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format', {
          email: 'Email must be a valid email address (e.g., user@example.com)'
        });
      }

      const user = await User.create(data);
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
      
      // Log the full error for debugging
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

  static async updateItem(id: number, data: any) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }

      // Validate email format if email is being updated
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new ValidationError('Invalid email format', {
            email: 'Email must be a valid email address (e.g., user@example.com)'
          });
        }
      }

      await user.update(data);
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

  static async deleteItem(id: number) {
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