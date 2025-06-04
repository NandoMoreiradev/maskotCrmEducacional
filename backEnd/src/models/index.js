const sequelize = require('../config/database');
const Sequelize = require('sequelize');

const UserAdmin = require('./UserAdmin');
const School = require('./School');
const User = require('./User'); // Utilizador da escola
const Prospect = require('./Prospect'); // Modelo de Prospect

// Definir Associações
School.hasMany(User, {
  foreignKey: 'schoolId',
  as: 'users',
  onDelete: 'CASCADE',
});
User.belongsTo(School, {
  foreignKey: 'schoolId',
  as: 'school',
});

// Novas Associações para Prospect
School.hasMany(Prospect, {
  foreignKey: 'schoolId',
  as: 'prospects',
  onDelete: 'CASCADE',
});
Prospect.belongsTo(School, {
  foreignKey: 'schoolId',
  as: 'school',
});
// No futuro, um Prospect pode ser associado a um User (membro da equipa que o registou/trata)
// User.hasMany(Prospect, { foreignKey: '담당자Id', as: 'handledProspects' }); // Exemplo
// Prospect.belongsTo(User, { foreignKey: '담당자Id', as: 'handler' }); // Exemplo


const db = {
  sequelize,
  Sequelize,
  UserAdmin,
  School,
  User,
  Prospect, // Adicionar Prospect ao objeto db
};

module.exports = db;