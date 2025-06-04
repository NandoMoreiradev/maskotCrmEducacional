import React, { useState, useEffect } from 'react';
import { useSchoolAuth } from '../../contexts/SchoolAuthContext'; // Use o novo contexto
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, CircularProgress, Alert, Link } from '@mui/material';

const SchoolLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { loginSchoolUser, isAuthenticated: isSchoolUserAuthenticated, schoolUser, isLoading: authIsLoading } = useSchoolAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Definir para onde redirecionar após o login bem-sucedido
  // Futuramente, será o dashboard da escola, ex: `/escola/${schoolUser.schoolId}/dashboard` ou um path genérico
  const from = location.state?.from?.pathname || "/school/dashboard"; // Placeholder para dashboard da escola

  useEffect(() => {
    if (isSchoolUserAuthenticated && !authIsLoading) {
      navigate(from, { replace: true });
    }
  }, [isSchoolUserAuthenticated, authIsLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await loginSchoolUser(email, password);
      // O useEffect cuidará do redirecionamento
    } catch (err) {
      setError(err.message || 'Falha no login. Verifique as suas credenciais.');
      console.error("Falha no login da escola:", err);
    } finally {
      setFormLoading(false);
    }
  };

  if (authIsLoading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isSchoolUserAuthenticated) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5">Bem-vindo(a), {schoolUser?.name}!</Typography>
        <Typography>Você está logado como utilizador da escola.</Typography>
        <Button component={RouterLink} to={from} variant="contained" sx={{mt: 2}}>
            Ir para o Dashboard da Escola
        </Button>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, padding: {xs: 2, sm: 4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login da Escola
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
            Acesso para diretores, professores e equipa.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Seu Email"
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
            label="Sua Senha"
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
            color="primary" // Pode usar a cor primária do tema
            sx={{ mt: 3, mb: 2 }}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {formLoading ? 'A Entrar...' : 'Entrar'}
          </Button>
          <Typography variant="body2" align="center">
            <Link component={RouterLink} to="/" >
              Voltar para a Página Inicial
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SchoolLoginPage;