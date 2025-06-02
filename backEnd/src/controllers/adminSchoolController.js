const School = require('../models/School');

// Criar uma nova escola (cliente)
exports.createSchool = async (req, res) => {
  try {
    // Adicionar validação dos dados de entrada (req.body) aqui
    const { name, corporateName, cnpj, email, phone, address, city, state, zipCode } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email da escola são obrigatórios.' });
    }

    const newSchool = await School.create({
      name,
      corporateName,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      status: 'active', // Ou 'pending' se precisar de aprovação
    });
    res.status(201).json({ message: 'Escola criada com sucesso!', school: newSchool });
  } catch (error) {
    // Tratar erros de validação do Sequelize (ex: unique constraint)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Erro: CNPJ, email ou nome da escola já cadastrado.', details: error.errors });
    }
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Erro de validação.', details: error.errors });
    }
    console.error("Erro ao criar escola:", error);
    res.status(500).json({ message: 'Erro ao criar escola.', error: error.message });
  }
};

// Listar todas as escolas
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
        // Adicionar ordenação, paginação se necessário
        order: [['name', 'ASC']]
    });
    res.status(200).json(schools);
  } catch (error) {
    console.error("Erro ao listar escolas:", error);
    res.status(500).json({ message: 'Erro ao listar escolas.', error: error.message });
  }
};

// Obter detalhes de uma escola específica
exports.getSchoolById = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }
    res.status(200).json(school);
  } catch (error) {
    console.error("Erro ao buscar escola:", error);
    res.status(500).json({ message: 'Erro ao buscar escola.', error: error.message });
  }
};

// Atualizar uma escola
exports.updateSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    // Adicionar validação dos dados de entrada (req.body) aqui
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }
    // O método update retorna um array, o primeiro elemento é o número de linhas afetadas
    const [updatedRows] = await School.update(req.body, { where: { id: schoolId } });

    if (updatedRows > 0) {
        const updatedSchool = await School.findByPk(schoolId); // Busca a escola atualizada
        return res.status(200).json({ message: 'Escola atualizada com sucesso!', school: updatedSchool });
    } else {
        // Isso pode acontecer se os dados enviados forem os mesmos já existentes
        // ou se o where não encontrar o registro (embora já tenhamos verificado com findByPk)
        return res.status(200).json({ message: 'Nenhuma alteração realizada ou escola não encontrada com os critérios de atualização.', school });
    }

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Erro: CNPJ, email ou nome da escola já cadastrado para outra escola.', details: error.errors });
    }
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Erro de validação.', details: error.errors });
    }
    console.error("Erro ao atualizar escola:", error);
    res.status(500).json({ message: 'Erro ao atualizar escola.', error: error.message });
  }
};

// Deletar uma escola (cuidado com esta operação!)
exports.deleteSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'Escola não encontrada.' });
    }
    await School.destroy({ where: { id: schoolId } });
    res.status(200).json({ message: 'Escola deletada com sucesso.' }); // Algumas APIs retornam 204 No Content
  } catch (error) {
    console.error("Erro ao deletar escola:", error);
    res.status(500).json({ message: 'Erro ao deletar escola.', error: error.message });
  }
};