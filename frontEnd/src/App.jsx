import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate } from 'react-router-dom';

// Páginas do Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SchoolUsersPage from './pages/admin/SchoolUsersPage';

// Páginas da Escola
import SchoolLoginPage from './pages/school/SchoolLoginPage';
import SchoolAdminDashboard from './pages/school/SchoolAdminDashboard'; // Importação do dashboard

// Componentes de Rota Protegida
import ProtectedRouteAdmin from './components/routes/ProtectedRouteAdmin';

// Contextos de Autenticação
import { useAdminAuth } from './contexts/AdminAuthContext';
import { useSchoolAuth } from './contexts/SchoolAuthContext';

// Componentes MUI
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress, Container, Link } from '@mui/material';

import SchoolProspectsPage from './pages/school/SchoolProspectsPage';
console.log("[App.jsx] Tipo de SchoolProspectsPage importado:", typeof SchoolProspectsPage, SchoolProspectsPage);

// ProtectedRouteSchool - MANTENHA OS LOGS AQUI
const ProtectedRouteSchool = ({ children }) => {
  const { isAuthenticated: isSchoolUserAuthenticated, isLoading: isSchoolUserLoading, schoolUser } = useSchoolAuth();

  console.log('[ProtectedRouteSchool] - Estado da Autenticação:');
  console.log('  isSchoolUserAuthenticated:', isSchoolUserAuthenticated);
  console.log('  isSchoolUserLoading:', isSchoolUserLoading);
  console.log('  schoolUser:', schoolUser);

  if (isSchoolUserLoading) {
    console.log('[ProtectedRouteSchool] - Renderizando loader...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>A verificar autenticação da escola...</Typography>
      </Box>
    );
  }

  if (!isSchoolUserAuthenticated) {
    console.log('[ProtectedRouteSchool] - Não autenticado, redirecionando para /school/login');
    return <Navigate to="/school/login" replace />;
  }

  console.log('[ProtectedRouteSchool] - Autenticado, renderizando children.');
  return children;
};


function App() {
  const { isAuthenticated: isAdminAuthenticated, logoutAdmin, admin, isLoading: isAdminLoading } = useAdminAuth();
  const { isAuthenticated: isSchoolUserAuthenticated, logoutSchoolUser, schoolUser, isLoading: isSchoolUserLoading } = useSchoolAuth();

  const isLoading = isAdminLoading || isSchoolUserLoading;

  console.log("[App.jsx] Tipo de SchoolAdminDashboard importado:", typeof SchoolAdminDashboard, SchoolAdminDashboard);
  console.log('[App.jsx] - Estado Geral de Carregamento:', isLoading);
  console.log('[App.jsx] - isAdminAuthenticated:', isAdminAuthenticated, 'isSchoolUserAuthenticated:', isSchoolUserAuthenticated);


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>A carregar aplicação...</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary">
          {/* ... (Conteúdo da AppBar como antes) ... */}
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link component={RouterLink} 
                    to={isAdminAuthenticated ? "/admin/dashboard" : (isSchoolUserAuthenticated ? "/school/dashboard" : "/")} 
                    color="inherit" sx={{ textDecoration: 'none' }}>
                Maskot CRM
              </Link>
            </Typography>
            
            {!isAdminAuthenticated && !isSchoolUserAuthenticated && (
              <>
                <Button color="inherit" component={RouterLink} to="/school/login" sx={{ mr: 1 }}>
                  Acesso Escola
                </Button>
                <Button color="inherit" component={RouterLink} to="/admin/login">
                  Admin
                </Button>
              </>
            )}
            {isAdminAuthenticated && admin && (
              <>
                <Typography sx={{ mr: 2, display: {xs: 'none', sm: 'block'} }}>
                  Super Admin: {admin.name}
                </Typography>
                <Button color="inherit" component={RouterLink} to="/admin/dashboard" sx={{ mr: 1}}>
                  Painel Admin
                </Button>
                <Button color="secondary" variant="contained" onClick={logoutAdmin}>
                  Logout Admin
                </Button>
              </>
            )}
            {isSchoolUserAuthenticated && schoolUser && (
                 <>
                    <Typography sx={{ mr: 2, display: {xs: 'none', sm: 'block'} }}>
                      Utilizador: {schoolUser.name} ({schoolUser.role})
                    </Typography>
                    <Button color="inherit" component={RouterLink} to="/school/dashboard" sx={{ mr: 1}}>
                        Meu Painel
                    </Button>
                    <Button color="secondary" variant="contained" onClick={logoutSchoolUser}>
                        Logout
                    </Button>
                 </>
            )}
          </Toolbar>
        </AppBar>
        
        <Container component="main" sx={{ mt: {xs: 2, sm: 4}, mb: 4, flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={
              <Box sx={{textAlign: 'center', py: {xs:2, sm:4} }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                  Bem-vindo ao Maskot CRM Educacional
                </Typography>
                {/* ... (mais conteúdo da home page) ... */}
              </Box>
            } />

            <Route path="/admin/login" element={isAdminAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage />} />
            <Route path="/school/login" element={isSchoolUserAuthenticated ? <Navigate to="/school/dashboard" /> : <SchoolLoginPage />} />
            
            <Route element={<ProtectedRouteAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/schools/:schoolId/users" element={<SchoolUsersPage />} />
              
            </Route>

            {/* TESTE: Rota /school/dashboard FORA do ProtectedRouteSchool temporariamente */}
            {/* Se o utilizador estiver autenticado, esta rota será acedida.         */}
            {/* Se não estiver, o ProtectedRouteSchool abaixo (se reativado) faria o redirect. */}
            {isSchoolUserAuthenticated ? (
                <Route 
                    path="/school/dashboard" 
                    element={
                        (() => {
                            console.log("[App.jsx - ROTA DIRETA /school/dashboard] Tentando renderizar SchoolAdminDashboard.");
                            return <SchoolAdminDashboard />;
                        })()
                    }
                />
            ) : (
                // Se não estiver autenticado, podemos redirecionar para o login da escola aqui também
                // ou deixar que o ProtectedRouteSchool (se estivesse a envolver) o fizesse.
                // Para este teste, se não autenticado, não haverá match para /school/dashboard aqui.
                null
            )}


            <Route element={<ProtectedRouteSchool />}>
              <Route 
                path="/school/dashboard" 
                element={<SchoolAdminDashboard />} 
              />
              <Route path="/school/prospects" element={<SchoolProspectsPage />} />
            </Route>
            
            <Route path="*" element={
              <Box sx={{textAlign: 'center', py:5}}>
                <Typography variant="h2" color="textSecondary">404</Typography>
                {/* ... (conteúdo da página 404) ... */}
              </Box>
            } />
          </Routes>
        </Container>

        <Box component="footer" sx={{ bgcolor: 'background.paper', p: {xs:2, sm:3}, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* ... (Conteúdo do Footer) ... */}
        </Box>
      </Box>
    </Router>
  );
}

export default App;