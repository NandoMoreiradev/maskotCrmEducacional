import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material'; // Imports do MUI

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false); // Renomeado para evitar conflito com isLoading do AuthContext
  const { loginAdmin, isAuthenticated, admin, isLoading: authIsLoading } = useAdminAuth(); // isLoading do contexto
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (isAuthenticated && !authIsLoading) { // Garante que a verificação inicial do auth terminou
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authIsLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await loginAdmin(email, password);
      // O useEffect cuidará do redirecionamento
    } catch (err) {
      setError(err.message || 'Falha no login. Verifique as suas credenciais.');
      console.error("Falha no login:", err);
    } finally {
      setFormLoading(false);
    }
  };

  if (authIsLoading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Se já estiver autenticado E o carregamento inicial do auth terminou, não mostra o form, espera o redirect do useEffect.
  // Isso evita um flash do formulário se o redirect demorar um tick.
  if (isAuthenticated) {
     return (
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Redirecionando...</Typography>
        <CircularProgress size={24} sx={{ ml: 2 }}/>
      </Container>
     );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login Administrador
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={formLoading}
          />
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {formLoading ? 'A Entrar...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLoginPage;