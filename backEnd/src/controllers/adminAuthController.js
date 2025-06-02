const UserAdmin = require('../models/UserAdmin');
const jwt = require('jsonwebtoken');
// bcrypt já está no model UserAdmin para hashing, mas pode ser necessário aqui se fôssemos comparar
// fora do método do protótipo, o que não é o caso.

// Registrar um novo administrador
// ATENÇÃO: Em um ambiente de produção, esta rota deve ser fortemente protegida
// ou a criação do primeiro admin deve ser feita via script.
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const existingAdmin = await UserAdmin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Este email de administrador já está cadastrado.' });
    }

    // O hook beforeCreate no model UserAdmin cuidará do hashing da senha
    const newAdmin = await UserAdmin.create({ name, email, password });

    // Não retorne a senha, mesmo hasheada.
    const adminData = { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email };

    res.status(201).json({ message: 'Administrador registrado com sucesso!', admin: adminData });

  } catch (error) {
    console.error("Erro ao registrar administrador:", error);
    // Tratar erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao registrar administrador.', error: error.message });
  }
};

// Login do administrador
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const admin = await UserAdmin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas. Administrador não encontrado.' }); // Email não encontrado
    }

    const isMatch = await admin.isValidPassword(password); // Usa o método do protótipo
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas. Senha incorreta.' }); // Senha incorreta
    }

    // Usuário autenticado, gerar token JWT
    const payload = {
      adminId: admin.id,
      email: admin.email,
      role: 'SUPER_ADMIN' // Definindo um papel para o admin
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expira em 1 dia (ex: '1h', '7d')
    );

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error("Erro no login do administrador:", error);
    res.status(500).json({ message: 'Erro interno no login do administrador.', error: error.message });
  }
};