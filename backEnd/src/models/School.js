// PASSO 2: DEFINIR O MODEL `School`
//
// Crie o arquivo: `backend/src/models/School.js`
// Cole o seguinte código:

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: { // Nome fantasia da escola
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  corporateName: { // Razão Social
    type: DataTypes.STRING,
    allowNull: true, // Pode ser opcional inicialmente
  },
  cnpj: { // CNPJ da escola
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // CNPJ deve ser único
    // Adicionar validação de CNPJ futuramente
  },
  email: { // Email principal de contato da escola
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: { // Endereço completo
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: { // UF
    type: DataTypes.STRING(2), // Limitar a 2 caracteres
    allowNull: true,
  },
  zipCode: { // CEP
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: { // Status da escola no sistema (ex: 'active', 'inactive', 'trial')
    type: DataTypes.STRING,
    defaultValue: 'pending', // Começa como pendente até ser ativada pelo admin
    allowNull: false,
  },
  // Adicionaremos campos para plano contratado, data de expiração, etc.
  // planId: {
  //   type: DataTypes.UUID,
  //   allowNull: true, // Ou false se toda escola deve ter um plano
  //   // references: { model: 'Plans', key: 'id' } // Chave estrangeira para um futuro model Plan
  // },
}, {
  tableName: 'schools',
  timestamps: true,
});

module.exports = School;
