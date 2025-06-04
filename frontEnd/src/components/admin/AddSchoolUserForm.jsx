import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminSchoolService from '../../services/adminSchoolService';
import {
    TextField, Button, Box, Typography, CircularProgress, Select,
    MenuItem, FormControl, InputLabel, Alert as MuiAlert, Switch, FormControlLabel
} from '@mui/material';

// Adicionamos editingUser como prop
const AddSchoolUserForm = ({ schoolId, onSuccess, onCancel, editingUser }) => {
  const { token } = useAdminAuth();
  const isEditMode = !!editingUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Senha só é obrigatória na criação
  const [role, setRole] = useState('SCHOOL_ADMIN');
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && editingUser) {
      setName(editingUser.name || '');
      setEmail(editingUser.email || '');
      setRole(editingUser.role || 'SCHOOL_ADMIN');
      setIsActive(editingUser.isActive === undefined ? true : editingUser.isActive);
      setPassword(''); // Não preenchemos a senha no modo de edição por segurança
    } else {
      // Reset para modo de adição
      setName('');
      setEmail('');
      setPassword('');
      setRole('SCHOOL_ADMIN');
      setIsActive(true);
    }
  }, [editingUser, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !role) {
      setError('Nome, Email e Papel são obrigatórios.');
      return;
    }
    if (!isEditMode && !password) { // Senha obrigatória apenas na criação
        setError('Senha é obrigatória para novos utilizadores.');
        return;
    }
    if (password && password.length < 6) {
        setError('A senha (se fornecida) deve ter pelo menos 6 caracteres.');
        return;
    }

    setError('');
    setIsLoading(true);

    const userData = { name, email, role, isActive };
    if (password) { // Só envia a senha se ela foi digitada (para criação ou atualização de senha)
      userData.password = password;
    }

    try {
      let response;
      if (isEditMode && editingUser) {
        response = await adminSchoolService.updateUserForSchool(schoolId, editingUser.id, userData, token);
      } else {
        response = await adminSchoolService.createUserForSchool(schoolId, userData, token);
      }
      onSuccess(response.data.user, isEditMode);
      if (!isEditMode) { // Limpa apenas se for adição
        setName(''); setEmail(''); setPassword(''); setRole('SCHOOL_ADMIN'); setIsActive(true);
      }
    } catch (err) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} utilizador:`, err);
      setError(err.response?.data?.message || err.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} utilizador.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {isEditMode ? 'Editar Utilizador da Escola' : 'Adicionar Novo Utilizador à Escola'}
      </Typography>
      
      <TextField margin="normal" required fullWidth id="userName" label="Nome" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} autoFocus={!isEditMode} />
      <TextField margin="normal" required fullWidth id="userEmail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
      <TextField margin="normal" fullWidth id="userPassword" label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} helperText={isEditMode ? "Deixe em branco para não alterar a senha. Mínimo 6 caracteres se preenchido." : "Mínimo 6 caracteres."} />
      
      <FormControl fullWidth margin="normal" required disabled={isLoading}>
        <InputLabel id="role-select-label">Papel (Role)</InputLabel>
        <Select labelId="role-select-label" id="userRole" value={role} label="Papel (Role)" onChange={(e) => setRole(e.target.value)}>
          <MenuItem value="SCHOOL_ADMIN">Admin da Escola</MenuItem>
          <MenuItem value="TEACHER">Professor(a)</MenuItem>
          <MenuItem value="STAFF">Equipa/Secretaria</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isLoading} />}
        label={isActive ? "Utilizador Ativo" : "Utilizador Inativo"}
        sx={{ mt: 1, mb:1 }}
      />

      {error && <MuiAlert severity="error" sx={{ width: '100%', mt: 2, mb:1 }}>{error}</MuiAlert>}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading} color="inherit">Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
          {isLoading ? (isEditMode ? 'A Atualizar...' : 'A Adicionar...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar Utilizador')}
        </Button>
      </Box>
    </Box>
  );
};
export default AddSchoolUserForm;