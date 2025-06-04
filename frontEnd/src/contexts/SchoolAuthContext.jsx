import React, { createContext, useState, useContext, useEffect } from 'react';
import schoolAuthService from '../services/schoolAuthService';

const SchoolAuthContext = createContext(null);

export const SchoolAuthProvider = ({ children }) => {
  const [schoolUser, setSchoolUser] = useState(null);
  const [schoolToken, setSchoolToken] = useState(localStorage.getItem('schoolToken'));
  const [isLoading, setIsLoading] = useState(true); // Para verificação inicial do token

  useEffect(() => {
    const storedUser = localStorage.getItem('schoolUser');
    if (schoolToken && storedUser) {
      try {
        setSchoolUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao fazer parse do schoolUser do localStorage", e);
        localStorage.removeItem('schoolUser');
        localStorage.removeItem('schoolToken');
        setSchoolToken(null);
      }
    }
    setIsLoading(false);
  }, [schoolToken]); // Dependência schoolToken para reavaliar se ele mudar externamente

  const loginSchoolUser = async (email, password) => {
    try {
      const data = await schoolAuthService.login(email, password);
      setSchoolToken(data.token);
      setSchoolUser(data.user);
      localStorage.setItem('schoolToken', data.token);
      localStorage.setItem('schoolUser', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error("Erro no contexto de loginSchoolUser:", error);
      throw error; // Relança o erro para ser tratado pelo componente de UI
    }
  };

  const logoutSchoolUser = () => {
    // schoolAuthService.logout(); // Se existir um endpoint de logout no backend
    setSchoolToken(null);
    setSchoolUser(null);
    localStorage.removeItem('schoolToken');
    localStorage.removeItem('schoolUser');
    // Adicionar redirecionamento para a página de login da escola aqui se desejado
    // window.location.href = '/school/login'; // Exemplo simples
  };

  const value = {
    schoolUser,
    schoolToken,
    isAuthenticated: !!schoolToken, // Verdadeiro se houver um token
    isLoading,
    loginSchoolUser,
    logoutSchoolUser,
  };

  // Só renderiza children após o carregamento inicial do estado de auth
  return (
    <SchoolAuthContext.Provider value={value}>
      {!isLoading && children}
    </SchoolAuthContext.Provider>
  );
};

export const useSchoolAuth = () => {
  const context = useContext(SchoolAuthContext);
  if (context === undefined) {
    throw new Error('useSchoolAuth deve ser usado dentro de um SchoolAuthProvider');
  }
  return context;
};