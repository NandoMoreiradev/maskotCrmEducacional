const jwt = require('jsonwebtoken');
const UserAdmin = require('../models/UserAdmin'); // Pode ser útil para buscar o usuário completo

exports.authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido ou token mal formatado.' });
  }

  const token = authHeader.split(' ')[1]; // Pega o token da string "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o token decodificado tem o adminId e o role esperado
    if (!decoded.adminId || decoded.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Acesso negado. Token inválido ou papel não autorizado.' });
    }

    // Opcional: Buscar o usuário no banco para garantir que ele ainda existe e está ativo
    // const admin = await UserAdmin.findByPk(decoded.adminId);
    // if (!admin) {
    //   return res.status(401).json({ message: 'Acesso negado. Administrador não encontrado.' });
    // }
    // req.admin = admin; // Anexa o objeto admin completo à requisição

    req.admin = decoded; // Anexa os dados decodificados do admin (payload do token) à requisição
    next(); // Passa para o próximo middleware ou controller

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Acesso negado. Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Acesso negado. Token inválido.' });
    }
    console.error("Erro na autenticação do token:", error);
    return res.status(500).json({ message: 'Erro interno na autenticação do token.' });
  }
};