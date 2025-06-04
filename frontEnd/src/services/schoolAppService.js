import axios from 'axios';

const API_BASE_URL_SCHOOL_APP = 'http://localhost:3001/api/school'; // Base URL para a API da aplicação da escola

// Função para obter o header de autorização com o token da escola
const schoolAuthHeader = (token) => {
  if (token) {
    return { Authorization: 'Bearer ' + token };
  } else {
    return {};
  }
};

// --- Funções para Utilizadores da Escola (geridos pelo SCHOOL_ADMIN) ---
const listMySchoolUsers = (token) => {
  return axios.get(`${API_BASE_URL_SCHOOL_APP}/users`, { headers: schoolAuthHeader(token) });
};
const createMySchoolUser = (userData, token) => {
  return axios.post(`${API_BASE_URL_SCHOOL_APP}/users`, userData, { headers: schoolAuthHeader(token) });
};
const updateMySchoolUser = (userId, userData, token) => {
  return axios.put(`${API_BASE_URL_SCHOOL_APP}/users/${userId}`, userData, { headers: schoolAuthHeader(token) });
};
const deleteMySchoolUser = (userId, token) => {
  return axios.delete(`${API_BASE_URL_SCHOOL_APP}/users/${userId}`, { headers: schoolAuthHeader(token) });
};

// --- NOVAS Funções para Prospects (geridos pelos utilizadores da escola) ---
const listMySchoolProspects = (token) => {
  return axios.get(`${API_BASE_URL_SCHOOL_APP}/prospects`, { headers: schoolAuthHeader(token) });
};

const createMySchoolProspect = async (prospectData, token) => {
  return axios.post(`${API_BASE_URL_SCHOOL_APP}/prospects`, prospectData, { headers: schoolAuthHeader(token) });
};

const getMySchoolProspectById = async (prospectId, token) => {
    return axios.get(`${API_BASE_URL_SCHOOL_APP}/prospects/${prospectId}`, { headers: schoolAuthHeader(token) });
};

const updateMySchoolProspect = async (prospectId, prospectData, token) => {
  return axios.put(`${API_BASE_URL_SCHOOL_APP}/prospects/${prospectId}`, prospectData, { headers: schoolAuthHeader(token) });
};

const deleteMySchoolProspect = async (prospectId, token) => {
  return axios.delete(`${API_BASE_URL_SCHOOL_APP}/prospects/${prospectId}`, { headers: schoolAuthHeader(token) });
};

const schoolAppService = {
  listMySchoolUsers,
  createMySchoolUser,
  updateMySchoolUser,
  deleteMySchoolUser,
  // Exportar novas funções de prospects
  listMySchoolProspects,
  createMySchoolProspect,
  getMySchoolProspectById,
  updateMySchoolProspect,
  deleteMySchoolProspect,
};

export default schoolAppService;