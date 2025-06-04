const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // Considerar se o email deve ser único globalmente ou apenas dentro de uma escola.
    // Para simplificar inicialmente, vamos torná-lo globalmente único.
    // Se for por escola, a constraint unique precisaria ser composta (email, schoolId)
    // o que é mais complexo com Sequelize ou exigiria um índice manual.
    unique: true, 
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SCHOOL_ADMIN', 'TEACHER', 'STAFF'), // Adicione mais papéis conforme necessário
    allowNull: false,
    defaultValue: 'STAFF', // Ou um papel padrão adequado
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  schoolId: { // Chave estrangeira para a tabela School
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'schools', // Nome da tabela 'schools'
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Ou 'SET NULL' se o utilizador puder existir sem escola
  },
  // Adicionar lastLogin, etc., conforme necessário
}, {
  tableName: 'users', // Nome da tabela para estes utilizadores
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = User;