import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ProtectedRouteAdmin = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    // Pode mostrar um spinner de carregamento aqui enquanto o auth é verificado
    return <div>Verificando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Redireciona para a página de login, guardando a localização atual
    // para que o usuário possa ser redirecionado de volta após o login.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Se autenticado, renderiza o componente filho (a página protegida)
  return <Outlet />; // Outlet renderiza os componentes filhos da rota aninhada
};

export default ProtectedRouteAdmin;