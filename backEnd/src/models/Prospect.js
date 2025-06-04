const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definindo os estágios do funil/Kanban como um ENUM para consistência
const PROSPECT_STATUSES = [
  'NOVO_CONTATO',       // Ex: Lead recém-chegado
  'QUALIFICACAO',       // Ex: Em processo de entender se tem perfil
  'VISITA_AGENDADA',    // Ex: Agendou uma visita à escola
  'PROPOSTA_APRESENTADA',// Ex: Proposta pedagógica/financeira enviada
  'NEGOCIACAO',         // Ex: Em negociação de termos
  'MATRICULADO',        // Ex: Prospecto convertido em aluno
  'DESCARTADO',         // Ex: Não tem interesse, não tem perfil, etc.
  'PERDIDO',            // Ex: Escolheu outra escola
];

const Prospect = sequelize.define('Prospect', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  studentName: { // Nome do potencial aluno
    type: DataTypes.STRING,
    allowNull: false,
  },
  guardianName: { // Nome do pai/mãe/responsável principal
    type: DataTypes.STRING,
    allowNull: true,
  },
  guardianEmail: {
    type: DataTypes.STRING,
    allowNull: true, // Pode ser opcional inicialmente
    validate: {
      isEmail: true,
    },
  },
  guardianPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gradeOfInterest: { // Série/Ano de interesse
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(...PROSPECT_STATUSES),
    allowNull: false,
    defaultValue: 'NOVO_CONTATO',
  },
  source: { // Origem do prospect (Ex: "Indicação", "Site", "Evento", "Redes Sociais")
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  schoolId: { // Chave estrangeira para a tabela School
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'schools', // Nome da tabela 'schools'
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', 
  },
  // Poderíamos adicionar 'expectedEnrollmentDate', 'assignedToUserId' (para qual membro da equipa está a tratar), etc.
}, {
  tableName: 'prospects',
  timestamps: true,
});

// Exportar os status para uso no frontend ou em outros lugares se necessário
Prospect.STATUSES = PROSPECT_STATUSES;

module.exports = Prospect;