require('dotenv').config();
const { app, testDbConnectionAndSync } = require('./src/app'); // ATUALIZADO AQUI

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await testDbConnectionAndSync(); // ATUALIZADO AQUI - Testa a conexão e sincroniza os modelos
    app.listen(PORT, () => {
      console.log(`Servidor backend do Maskot CRM Educacional rodando na porta ${PORT}`);
      console.log(`Acesse em http://localhost:${PORT}`);
      console.log(`Rotas de admin de escolas disponíveis em /api/admin/schools`);
      console.log(`Rotas de autenticação de admin em /api/admin/auth`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();