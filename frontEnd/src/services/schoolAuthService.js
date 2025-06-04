import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/school'; // URL base da API de autenticação da escola

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    if (response.data.token) {
      // O token e os dados do utilizador serão guardados pelo AuthContext
      console.log("Login de utilizador da escola bem-sucedido, token:", response.data.token);
    }
    return response.data; // Retorna { message, token, user }
  } catch (error) {
    console.error("Erro no serviço de login da escola:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Erro de rede ou servidor indisponível');
  }
};

// Futuramente, poderemos adicionar registro (se aplicável), logout, etc.
// const logout = () => { ... };

const schoolAuthService = {
  login,
  // logout,
};

export default schoolAuthService;