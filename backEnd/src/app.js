require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Importar Models (para sincronização inicial, se desejado)
const UserAdmin = require('./models/UserAdmin');
const School = require('./models/School');

// Importar Rotas
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminSchoolRoutes = require('./routes/adminSchoolRoutes');
// const crmRoutes = require('./routes/crmRoutes'); // Adicionaremos depois
// const authRoutes = require('./routes/authRoutes'); // Para usuários das escolas, depois

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

async function testDbConnectionAndSync() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso via app.js.');

    // ATENÇÃO: sequelize.sync() é útil para desenvolvimento, pois cria as tabelas se não existirem.
    // Em produção, é mais seguro usar Migrations.
    // O { alter: true } tenta alterar as tabelas para corresponder aos modelos,
    // mas pode ser destrutivo. Use com cautela. { force: true } apaga e recria as tabelas.
    await sequelize.sync({ alter: true }); // Ou apenas .sync()
    console.log('Modelos sincronizados com o banco de dados.');

  } catch (error) {
    console.error('Não foi possível conectar/sincronizar com o banco de dados PostgreSQL via app.js:', error);
    throw error;
  }
}

// Rota de teste inicial
app.get('/', (req, res) => {
  res.send('Olá! Servidor do Maskot CRM Educacional (com PostgreSQL e estrutura modular) está no ar!');
});

// Rota de teste para verificar a conexão com o banco
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ message: 'Conexão com o PostgreSQL bem-sucedida pela rota /test-db!' });
  } catch (error) {
    console.error('Erro ao testar a conexão com o DB via rota /test-db:', error);
    res.status(500).json({ message: 'Falha na conexão com o PostgreSQL.', error: error.message });
  }
});

// Configurar Rotas Principais
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/schools', adminSchoolRoutes);
// app.use('/api/crm', crmRoutes);
// app.use('/api/auth', authRoutes); // Para usuários das escolas

// Exporta o app e a função de teste/sync de DB para o index.js
module.exports = { app, testDbConnectionAndSync }; // ATUALIZADO AQUI