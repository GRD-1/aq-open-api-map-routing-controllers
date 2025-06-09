const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('oauth_clients', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'client_id'
      },
      clientSecret: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'client_secret'
      },
      redirectUris: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        field: 'redirect_uris'
      },
      grants: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
    });

    await queryInterface.createTable('oauth_tokens', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      accessToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'access_token'
      },
      accessTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'access_token_expires_at'
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'refresh_token'
      },
      refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'refresh_token_expires_at'
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'client_id'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('oauth_tokens');
    await queryInterface.dropTable('oauth_clients');
  }
}; 