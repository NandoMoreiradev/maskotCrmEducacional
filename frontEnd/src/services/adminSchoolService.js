import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/admin/schools';

const authHeader = (token) => {
  if (token) {
    return { Authorization: 'Bearer ' + token };
  } else {
    return {};
  }
};

// --- Funções para Escolas (existentes) ---
const getAllSchools = (token) => axios.get(API_BASE_URL, { headers: authHeader(token) });
const createSchool = (schoolData, token) => axios.post(API_BASE_URL, schoolData, { headers: authHeader(token) });
const getSchoolById = (id, token) => axios.get(`${API_BASE_URL}/${id}`, { headers: authHeader(token) });
const updateSchool = (id, schoolData, token) => axios.put(`${API_BASE_URL}/${id}`, schoolData, { headers: authHeader(token) });
const deleteSchool = (id, token) => axios.delete(`${API_BASE_URL}/${id}`, { headers: authHeader(token) });

// --- Funções para Utilizadores de Escola (existentes e novas) ---
const getUsersForSchool = (schoolId, token) => {
  return axios.get(`${API_BASE_URL}/${schoolId}/users`, { headers: authHeader(token) });
};
const createUserForSchool = (schoolId, userData, token) => {
  return axios.post(`${API_BASE_URL}/${schoolId}/users`, userData, { headers: authHeader(token) });
};
// NOVAS FUNÇÕES
const updateUserForSchool = (schoolId, userId, userData, token) => {
  return axios.put(`${API_BASE_URL}/${schoolId}/users/${userId}`, userData, { headers: authHeader(token) });
};
const deleteUserForSchool = (schoolId, userId, token) => {
  return axios.delete(`${API_BASE_URL}/${schoolId}/users/${userId}`, { headers: authHeader(token) });
};

const adminSchoolService = {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getUsersForSchool,
  createUserForSchool,
  updateUserForSchool, // Exportar nova função
  deleteUserForSchool, // Exportar nova função
};

export default adminSchoolService;