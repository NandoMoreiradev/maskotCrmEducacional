import React, { createContext, useState, useContext, useEffect } from 'react';
import adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken')); // Tenta carregar o token do localStorage
  const [loading, setLoading] = useState(true); // Para verificar o token inicial

  useEffect(() => {
    // Lógica para verificar se o token armazenado ainda é válido ao carregar a app
    // Por agora, vamos simplificar: se há token, consideramos o utilizador "potencialmente" logado.
    // Uma verificação real envolveria validar o token com o backend ou buscar dados do utilizador.
    const storedAdmin = localStorage.getItem('adminUser');
    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        console.error("Erro ao fazer parse do adminUser do localStorage", e);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const loginAdmin = async (email, password) => {
    try {
      const data = await adminAuthService.login(email, password);
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin)); // Armazena dados do admin
      return data;
    } catch (error) {
      // O erro já é tratado e lançado pelo service, mas podemos relançar ou tratar aqui.
      console.error("Erro no contexto de loginAdmin:", error);
      throw error;
    }
  };

  const logoutAdmin = () => {
    adminAuthService.logout();
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const value = {
    admin,
    token,
    isAuthenticated: !!token, // Verdadeiro se houver um token
    isLoading: loading,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
};
