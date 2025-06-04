require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Importa o objeto db de models/index.js

// Importar Rotas
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminSchoolRoutes = require('./routes/adminSchoolRoutes');
const adminSchoolUserRoutes = require('./routes/adminSchoolUserRoutes');
const schoolAuthRoutes = require('./routes/schoolAuthRoutes');
const schoolAppUserRoutes = require('./routes/schoolAppUserRoutes');
const schoolAppProspectRoutes = require('./routes/schoolAppProspectRoutes'); // Novas rotas de prospects

const app = express();

app.use(cors());
app.use(express.json());

async function testDbConnectionAndSync() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso via app.js.');
    await db.sequelize.sync({ alter: true }); 
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Não foi possível conectar/sincronizar com o banco de dados PostgreSQL via app.js:', error);
    throw error;
  }
}

app.get('/', (req, res) => { res.send('Servidor do Maskot CRM Educacional no ar!'); });
app.get('/test-db', async (req, res) => { try { await db.sequelize.authenticate(); res.status(200).json({ message: 'Conexão DB OK!'}); } catch(e){ res.status(500).json({message: 'DB Falhou'})}});

// Rotas de Super Admin
app.use('/api/admin/auth', adminAuthRoutes);
adminSchoolRoutes.use('/:schoolId/users', adminSchoolUserRoutes);
app.use('/api/admin/schools', adminSchoolRoutes);

// Rotas de Autenticação da Escola
app.use('/api/auth/school', schoolAuthRoutes);

// Rotas da Aplicação da Escola (protegidas por authenticateSchoolUser ou similar)
app.use('/api/school/users', schoolAppUserRoutes);
app.use('/api/school/prospects', schoolAppProspectRoutes); // Adiciona as rotas de prospects


module.exports = { app, testDbConnectionAndSync };