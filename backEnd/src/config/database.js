// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../../.env' }); // Garante que o .env da raiz do backend seja lido

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
  }
);

module.exports = sequelize;