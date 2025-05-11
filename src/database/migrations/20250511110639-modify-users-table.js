'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, rename first_name to name
    await queryInterface.renameColumn('users', 'first_name', 'name');

    // Remove last_name, role, and is_active columns
    await queryInterface.removeColumn('users', 'last_name');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'is_active');

    // Add deleted_at column
    await queryInterface.addColumn('users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Update created_at and updated_at to have default values
    await queryInterface.changeColumn('users', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.changeColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert all changes
    await queryInterface.renameColumn('users', 'name', 'first_name');

    await queryInterface.addColumn('users', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.removeColumn('users', 'deleted_at');

    // Revert created_at and updated_at to their original state
    await queryInterface.changeColumn('users', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
