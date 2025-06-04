const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Usaremos o modelo User para verificar se o utilizador ainda existe

const authenticateSchoolUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se o payload do token contém os campos esperados para um utilizador de escola
    if (!decoded.userId || !decoded.schoolId || !decoded.role) {
      return res.status(403).json({ message: 'Acesso negado. Token inválido (payload incorreto).' });
    }

    // Opcional: Verificar se o utilizador ainda existe e está ativo no banco de dados
    const user = await User.findOne({ where: { id: decoded.userId, schoolId: decoded.schoolId, isActive: true } });
    if (!user) {
      return res.status(401).json({ message: 'Acesso negado. Utilizador não encontrado, inativo ou não pertence a esta escola.' });
    }

    // Anexa os dados decodificados (e verificados) do utilizador à requisição
    // req.user já pode ser usado pelo super admin, então vamos usar req.schoolApiUser para evitar conflitos
    req.schoolApiUser = {
      id: user.id, // ou decoded.userId
      email: user.email, // ou decoded.email
      role: user.role, // ou decoded.role
      schoolId: user.schoolId, // ou decoded.schoolId
    };
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Acesso negado. Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Acesso negado. Token inválido.' });
    }
    console.error("Erro na autenticação do token do utilizador da escola:", error);
    return res.status(500).json({ message: 'Erro interno na autenticação do token.' });
  }
};

module.exports = { authenticateSchoolUser };