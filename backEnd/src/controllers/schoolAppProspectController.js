const { Prospect, School } = require('../models'); // Prospect e School dos modelos centralizados
const { Op } = require('sequelize');

// Criar um novo prospect para a escola do utilizador logado
exports.createProspect = async (req, res) => {
  const schoolId = req.schoolApiUser.schoolId; // Obtido do token via middleware authenticateSchoolUser
  const { studentName, guardianName, guardianEmail, guardianPhone, gradeOfInterest, status, source, notes } = req.body;

  if (!studentName) {
    return res.status(400).json({ message: 'O nome do potencial aluno é obrigatório.' });
  }
  // Validar se o status enviado é um dos permitidos
  if (status && !Prospect.STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status '${status}' inválido.` });
  }

  try {
    const prospect = await Prospect.create({
      studentName,
      guardianName,
      guardianEmail,
      guardianPhone,
      gradeOfInterest,
      status: status || Prospect.STATUSES[0], // Default para o primeiro status se não fornecido
      source,
      notes,
      schoolId,
    });
    res.status(201).json(prospect);
  } catch (error) {
    console.error("Erro ao criar prospect:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao criar prospect.', error: error.message });
  }
};

// Listar todos os prospects da escola do utilizador logado
exports.listProspects = async (req, res) => {
  const schoolId = req.schoolApiUser.schoolId;
  try {
    const prospects = await Prospect.findAll({
      where: { schoolId },
      order: [['status', 'ASC'], ['updatedAt', 'DESC']], // Ordena por status e depois por data de atualização
    });
    res.status(200).json(prospects);
  } catch (error) {
    console.error("Erro ao listar prospects:", error);
    res.status(500).json({ message: 'Erro interno ao listar prospects.', error: error.message });
  }
};

// Obter detalhes de um prospect específico
exports.getProspectById = async (req, res) => {
  const schoolId = req.schoolApiUser.schoolId;
  const { prospectId } = req.params;
  try {
    const prospect = await Prospect.findOne({ where: { id: prospectId, schoolId } });
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect não encontrado nesta escola.' });
    }
    res.status(200).json(prospect);
  } catch (error) {
    console.error("Erro ao buscar prospect:", error);
    res.status(500).json({ message: 'Erro interno ao buscar prospect.', error: error.message });
  }
};

// Atualizar um prospect (incluindo o status para o Kanban)
exports.updateProspect = async (req, res) => {
  const schoolId = req.schoolApiUser.schoolId;
  const { prospectId } = req.params;
  const { studentName, guardianName, guardianEmail, guardianPhone, gradeOfInterest, status, source, notes } = req.body;

  // Validar se o status enviado é um dos permitidos
  if (status && !Prospect.STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status '${status}' inválido.` });
  }

  try {
    const prospect = await Prospect.findOne({ where: { id: prospectId, schoolId } });
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect não encontrado nesta escola.' });
    }

    // Atualiza os campos fornecidos
    if (studentName) prospect.studentName = studentName;
    if (guardianName) prospect.guardianName = guardianName;
    if (guardianEmail !== undefined) prospect.guardianEmail = guardianEmail; // Permite limpar email
    if (guardianPhone !== undefined) prospect.guardianPhone = guardianPhone;
    if (gradeOfInterest) prospect.gradeOfInterest = gradeOfInterest;
    if (status) prospect.status = status;
    if (source !== undefined) prospect.source = source;
    if (notes !== undefined) prospect.notes = notes;

    await prospect.save();
    res.status(200).json(prospect);
  } catch (error) {
    console.error("Erro ao atualizar prospect:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar prospect.', error: error.message });
  }
};

// Excluir um prospect
exports.deleteProspect = async (req, res) => {
  const schoolId = req.schoolApiUser.schoolId;
  const { prospectId } = req.params;
  try {
    const prospect = await Prospect.findOne({ where: { id: prospectId, schoolId } });
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect não encontrado nesta escola.' });
    }
    await prospect.destroy();
    res.status(200).json({ message: 'Prospect excluído com sucesso.' });
  } catch (error) {
    console.error("Erro ao excluir prospect:", error);
    res.status(500).json({ message: 'Erro interno ao excluir prospect.', error: error.message });
  }
};