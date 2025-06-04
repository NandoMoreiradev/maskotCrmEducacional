import axios from 'axios';

const API_URL = 'http://localhost:3001/api/admin/auth'; // URL base da sua API de autenticação do admin

const register = (name, email, password) => {
  return axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
  });
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    if (response.data.token) {
      // Armazena o token e os dados do admin (ex: no localStorage ou context)
      // Por agora, vamos apenas retornar os dados para o componente de login tratar.
      console.log("Login bem-sucedido, token:", response.data.token);
    }
    return response.data; // Retorna { message, token, admin }
  } catch (error) {
    console.error("Erro no serviço de login:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Erro de rede ou servidor indisponível');
  }
};

const logout = () => {
  // Lógica de logout (ex: remover token do localStorage e do context)
  // Por agora, pode ser apenas um placeholder.
  console.log("Serviço de logout chamado.");
};

const adminAuthService = {
  register,
  login,
  logout,
};

export default adminAuthService;