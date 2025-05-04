import { Model, DataTypes, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public first_name!: string;
  public last_name!: string;
  public role!: 'user' | 'admin';
  public is_active!: boolean;
  public last_login_at!: Date;
  public created_at!: Date;
  public updated_at!: Date;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM('user', 'admin'),
          defaultValue: 'user',
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User',
      }
    );
    return User;
  }
} 