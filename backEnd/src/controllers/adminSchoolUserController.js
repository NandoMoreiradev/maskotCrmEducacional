const { User, School } = require('../models');
const bcrypt = require('bcryptjs'); // Necessário para verificar se a senha precisa ser atualizada

// Criar um novo utilizador para uma escola específica (função existente)
exports.createUserForSchool = async (req, res) => {
  // ... (código como definido anteriormente) ...
  const { schoolId } = req.params;
  const { name, email, password, role, isActive } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nome, email, senha e papel são obrigatórios.' });
  }
  if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso por outro utilizador.' });
    }
    
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      isActive: isActive === undefined ? true : isActive,
      schoolId: school.id,
    });

    const userData = { /* ... dados do utilizador sem senha ... */
        id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role,
        isActive: newUser.isActive, schoolId: newUser.schoolId,
        createdAt: newUser.createdAt, updatedAt: newUser.updatedAt,
     };
    res.status(201).json({ message: `Utilizador ${role} criado com sucesso para a escola ${school.name}!`, user: userData });
  } catch (error) {
    console.error("Erro ao criar utilizador para escola:", error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Erro de validação ou conflito de dados.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao criar utilizador para escola.', error: error.message });
  }
};

// Listar todos os utilizadores de uma escola específica (função existente)
exports.getUsersForSchool = async (req, res) => {
  // ... (código como definido anteriormente) ...
  const { schoolId } = req.params;
  try {
    const school = await School.findByPk(schoolId, {
      include: [{
        model: User,
        as: 'users',
        attributes: { exclude: ['password'] },
      }],
      order: [[{ model: User, as: 'users' }, 'name', 'ASC']] // Ordena usuários por nome
    });
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }
    res.status(200).json(school.users || []);
  } catch (error) {
    console.error("Erro ao listar utilizadores da escola:", error);
    res.status(500).json({ message: 'Erro interno ao listar utilizadores da escola.', error: error.message });
  }
};

// --- NOVAS FUNÇÕES ---

// Atualizar um utilizador de uma escola específica
exports.updateUserForSchool = async (req, res) => {
  const { schoolId, userId } = req.params;
  const { name, email, password, role, isActive } = req.body;

  try {
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }

    const user = await User.findOne({ where: { id: userId, schoolId: schoolId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado nesta escola.' });
    }

    // Verificar se o novo email (se fornecido e diferente do atual) já existe
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ where: { email } });
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return res.status(400).json({ message: 'Este email já está em uso por outro utilizador.' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    // Atualizar senha apenas se uma nova senha for fornecida
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
        }
      // O hook beforeUpdate no modelo User cuidará do hashing
      user.password = password;
    }

    await user.save();

    const { password: _, ...userData } = user.get({ plain: true }); // Exclui a senha da resposta
    res.status(200).json({ message: 'Utilizador atualizado com sucesso!', user: userData });

  } catch (error) {
    console.error("Erro ao atualizar utilizador da escola:", error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Erro de validação ou conflito.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar utilizador.', error: error.message });
  }
};

// Excluir um utilizador de uma escola específica
exports.deleteUserForSchool = async (req, res) => {
  const { schoolId, userId } = req.params;

  try {
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }

    const user = await User.findOne({ where: { id: userId, schoolId: schoolId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado nesta escola.' });
    }

    // Adicionar verificação: não permitir excluir o único SCHOOL_ADMIN da escola? (Lógica de negócio)
    // if (user.role === 'SCHOOL_ADMIN') {
    //   const otherAdmins = await User.count({ where: { schoolId, role: 'SCHOOL_ADMIN', id: { [Op.ne]: userId } } });
    //   if (otherAdmins === 0) {
    //     return res.status(400).json({ message: 'Não é possível excluir o único administrador da escola.' });
    //   }
    // }

    await user.destroy();
    res.status(200).json({ message: 'Utilizador excluído com sucesso.' });

  } catch (error) {
    console.error("Erro ao excluir utilizador da escola:", error);
    res.status(500).json({ message: 'Erro interno ao excluir utilizador.', error: error.message });
  }
};