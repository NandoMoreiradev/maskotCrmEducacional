const { User, School } = require('../models'); // Assegure-se que School também é importado se precisar de detalhes dela.
const { Op } = require('sequelize'); // Para operadores como "não igual" (ne)

// Listar todos os utilizadores da escola do SCHOOL_ADMIN logado
exports.listMySchoolUsers = async (req, res) => {
  const schoolIdFromToken = req.schoolApiUser.schoolId; // Obtido do token via middleware

  try {
    const users = await User.findAll({
      where: { schoolId: schoolIdFromToken },
      attributes: { exclude: ['password', 'schoolId'] }, // Não precisa retornar schoolId em cada user, já é o contexto.
      order: [['name', 'ASC']],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar utilizadores da minha escola:", error);
    res.status(500).json({ message: 'Erro interno ao listar utilizadores.', error: error.message });
  }
};

// Criar um novo utilizador para a escola do SCHOOL_ADMIN logado
exports.createMySchoolUser = async (req, res) => {
  const schoolIdFromToken = req.schoolApiUser.schoolId;
  const creatingUserRole = req.schoolApiUser.role; // Papel de quem está a criar

  const { name, email, password, role, isActive } = req.body;

  if (creatingUserRole !== 'SCHOOL_ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores da escola podem criar novos utilizadores.' });
  }

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nome, email, senha e papel são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  // O SCHOOL_ADMIN não pode criar outro SCHOOL_ADMIN (regra de exemplo, pode ser ajustada)
  if (role === 'SCHOOL_ADMIN') {
    return res.status(403).json({ message: 'Não é permitido criar outro administrador da escola por esta interface.' });
  }
  // Validar se o papel é permitido (ex: 'TEACHER', 'STAFF')
  const allowedRoles = ['TEACHER', 'STAFF'];
  if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Papel '${role}' inválido. Papéis permitidos: ${allowedRoles.join(', ')}.` });
  }

  try {
    // Verificar se o email já existe globalmente (conforme modelo User)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }
    
    const newUser = await User.create({
      name,
      email,
      password, // O hook beforeCreate cuidará do hashing
      role,
      isActive: isActive === undefined ? true : isActive,
      schoolId: schoolIdFromToken,
    });

    const { password: _, ...userData } = newUser.get({ plain: true });
    res.status(201).json({ message: `Utilizador ${role} criado com sucesso!`, user: userData });

  } catch (error) {
    console.error("Erro ao criar utilizador na minha escola:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao criar utilizador.', error: error.message });
  }
};

// Atualizar um utilizador da escola do SCHOOL_ADMIN logado
exports.updateMySchoolUser = async (req, res) => {
  const schoolIdFromToken = req.schoolApiUser.schoolId;
  const creatingUserRole = req.schoolApiUser.role;
  const { userId } = req.params; // ID do utilizador a ser atualizado
  const { name, email, password, role, isActive } = req.body;

  if (creatingUserRole !== 'SCHOOL_ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores da escola podem atualizar utilizadores.' });
  }

  try {
    const userToUpdate = await User.findOne({ where: { id: userId, schoolId: schoolIdFromToken } });
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Utilizador não encontrado nesta escola.' });
    }

    // Restrições: SCHOOL_ADMIN não pode alterar o papel de outro SCHOOL_ADMIN (se existir)
    // nem pode alterar o seu próprio papel por esta via.
    // Também não pode promover outros para SCHOOL_ADMIN.
    if (role) {
        if (role === 'SCHOOL_ADMIN' && userToUpdate.id !== req.schoolApiUser.id) { // Tentando promover outro para SCHOOL_ADMIN
             return res.status(403).json({ message: 'Não é permitido promover outro utilizador a administrador da escola.' });
        }
        if (userToUpdate.role === 'SCHOOL_ADMIN' && role !== 'SCHOOL_ADMIN' && userToUpdate.id === req.schoolApiUser.id) { // Tentando rebaixar a si mesmo
            return res.status(403).json({ message: 'Não pode alterar o seu próprio papel de administrador da escola por aqui.' });
        }
        // Se o utilizador a ser editado é um SCHOOL_ADMIN e não é o próprio, não permitir mudança de papel
        if (userToUpdate.role === 'SCHOOL_ADMIN' && userToUpdate.id !== req.schoolApiUser.id && role !== 'SCHOOL_ADMIN') {
             return res.status(403).json({ message: 'Não pode alterar o papel de outro administrador da escola.' });
        }
        const allowedRoles = ['TEACHER', 'STAFF'];
        if (!allowedRoles.includes(role) && role !== userToUpdate.role) { // Permite manter o papel atual
             return res.status(400).json({ message: `Papel '${role}' inválido.` });
        }
        userToUpdate.role = role;
    }


    if (email && email !== userToUpdate.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Este email já está em uso por outro utilizador.' });
      }
      userToUpdate.email = email;
    }

    if (name) userToUpdate.name = name;
    if (isActive !== undefined) userToUpdate.isActive = isActive;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      userToUpdate.password = password; // O hook beforeUpdate cuidará do hashing
    }

    await userToUpdate.save();
    const { password: _, ...userData } = userToUpdate.get({ plain: true });
    res.status(200).json({ message: 'Utilizador atualizado com sucesso!', user: userData });

  } catch (error) {
    console.error("Erro ao atualizar utilizador na minha escola:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar utilizador.', error: error.message });
  }
};

// Excluir um utilizador da escola do SCHOOL_ADMIN logado
exports.deleteMySchoolUser = async (req, res) => {
  const schoolIdFromToken = req.schoolApiUser.schoolId;
  const creatingUserRole = req.schoolApiUser.role;
  const { userId } = req.params;

  if (creatingUserRole !== 'SCHOOL_ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores da escola podem excluir utilizadores.' });
  }

  // O SCHOOL_ADMIN não pode excluir a si próprio
  if (userId === req.schoolApiUser.id) {
    return res.status(403).json({ message: 'Não pode excluir a sua própria conta de administrador.' });
  }

  try {
    const userToDelete = await User.findOne({ where: { id: userId, schoolId: schoolIdFromToken } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilizador não encontrado nesta escola.' });
    }

    // Um SCHOOL_ADMIN não pode excluir outro SCHOOL_ADMIN (regra de exemplo)
    if (userToDelete.role === 'SCHOOL_ADMIN') {
        return res.status(403).json({ message: 'Não é permitido excluir outro administrador da escola.' });
    }

    await userToDelete.destroy();
    res.status(200).json({ message: 'Utilizador excluído com sucesso.' });

  } catch (error) {
    console.error("Erro ao excluir utilizador da minha escola:", error);
    res.status(500).json({ message: 'Erro interno ao excluir utilizador.', error: error.message });
  }
};