import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { User } from './models/user';

// Load environment variables
dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: (msg) => console.debug('[Database]', msg),
  define: {
    timestamps: true,
    underscored: true,
  }
});

// Initialize models
const models = {
  User: User.initModel(sequelize),
};

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.info('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, models };
export default sequelize; 