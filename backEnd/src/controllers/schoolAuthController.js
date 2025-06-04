const { User } = require('../models'); // Importa o modelo User (utilizadores das escolas)
const jwt = require('jsonwebtoken');
// bcrypt já está no modelo User para comparação de senha através do método isValidPassword

exports.loginSchoolUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas. Utilizador não encontrado.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Acesso negado. Conta de utilizador inativa.' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas. Senha incorreta.' });
    }

    // Utilizador autenticado, gerar token JWT
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,        // Ex: 'SCHOOL_ADMIN', 'TEACHER'
      schoolId: user.schoolId // ID da escola à qual o utilizador pertence
    };

    // Usaremos o mesmo JWT_SECRET por enquanto.
    // Em sistemas muito grandes, pode-se considerar segredos diferentes.
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // O mesmo segredo usado para o super admin
      { expiresIn: '1d' }    // Token expira em 1 dia (ou conforme sua política)
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: { // Retornar dados básicos do utilizador, sem a senha
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Erro no login do utilizador da escola:", error);
    res.status(500).json({ message: 'Erro interno no login do utilizador da escola.', error: error.message });
  }
};