import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik'; // Importe useFormik
import * as Yup from 'yup';       // Importe Yup
import { useSchoolAuth } from '../../contexts/SchoolAuthContext';
import schoolAppService from '../../services/schoolAppService';
import {
    TextField, Button, Box, Typography, CircularProgress, Select,
    MenuItem, FormControl, InputLabel, Alert as MuiAlert, Switch, FormControlLabel
} from '@mui/material';

// Esquema de Validação com Yup para Utilizador da Escola
const SchoolUserValidationSchema = (isEditMode = false) => Yup.object().shape({
  name: Yup.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .required('O nome é obrigatório'),
  email: Yup.string()
    .email('Formato de email inválido')
    .required('O email é obrigatório'),
  password: Yup.string()
    .when([], { // Validação condicional para senha
      is: () => !isEditMode, // Se NÃO for modo de edição (ou seja, criação)
      then: (schema) => schema.min(6, 'A senha deve ter pelo menos 6 caracteres').required('A senha é obrigatória para novos utilizadores'),
      otherwise: (schema) => schema.min(6, 'A nova senha deve ter pelo menos 6 caracteres').nullable().transform(value => value === '' ? null : value), // Opcional na edição, mas se preenchida, min 6 chars
    }),
  role: Yup.string()
    .required('O papel é obrigatório')
    .oneOf(['TEACHER', 'STAFF', 'SCHOOL_ADMIN'], 'Papel inválido'), // Garante que o papel é um dos permitidos
  isActive: Yup.boolean(),
});

const SchoolAdminUserForm = ({ onSuccess, onCancel, editingUser }) => {
  const { schoolToken, schoolUser: loggedInSchoolUser } = useSchoolAuth(); // Para verificar se está a editar a si mesmo
  const isEditMode = !!editingUser;

  const [apiError, setApiError] = useState(''); // Para erros vindos da API

  const formik = useFormik({
    initialValues: {
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      password: '', // Sempre começa vazio
      role: editingUser?.role || 'TEACHER', // Papel padrão para novos usuários
      isActive: editingUser?.isActive === undefined ? true : editingUser.isActive,
    },
    validationSchema: SchoolUserValidationSchema(isEditMode),
    enableReinitialize: true, // Importante para preencher o formulário no modo de edição
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError('');
      const userData = {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
      };

      // Adiciona a senha apenas se foi preenchida (para criação ou atualização)
      if (values.password) {
        userData.password = values.password;
      } else if (!isEditMode) {
        // Se for criação e a senha estiver vazia (não deveria acontecer devido ao Yup, mas como fallback)
        setApiError("Senha é obrigatória para novos utilizadores.");
        setSubmitting(false);
        return;
      }

      try {
        let response;
        if (isEditMode && editingUser) {
          response = await schoolAppService.updateMySchoolUser(editingUser.id, userData, schoolToken);
        } else {
          response = await schoolAppService.createMySchoolUser(userData, schoolToken);
        }
        onSuccess(response.data.user, isEditMode);
        if (!isEditMode) {
          resetForm(); // Limpa o formulário do Formik
        }
        // O componente pai (SchoolAdminDashboard) fechará o modal
      } catch (err) {
        console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} utilizador:`, err);
        const errMsg = err.response?.data?.message || err.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} utilizador.`;
        setApiError(errMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });
  
  // Papéis que um SCHOOL_ADMIN pode atribuir/editar.
  // Um SCHOOL_ADMIN não pode criar outro SCHOOL_ADMIN nem rebaixar a si mesmo.
  const assignableRoles = [
    { value: 'TEACHER', label: 'Professor(a)' },
    { value: 'STAFF', label: 'Equipa/Secretaria' },
  ];
  // Se estiver a editar o próprio SCHOOL_ADMIN logado, permite que o papel 'SCHOOL_ADMIN' seja selecionado (para não dar erro de validação)
  // mas o campo estará desabilitado.
  if (isEditMode && editingUser && editingUser.id === loggedInSchoolUser?.id && editingUser.role === 'SCHOOL_ADMIN') {
    if (!assignableRoles.find(r => r.value === 'SCHOOL_ADMIN')) {
        assignableRoles.unshift({ value: 'SCHOOL_ADMIN', label: 'Admin da Escola (Atual)' });
    }
  }

  const isEditingSelfAsSchoolAdmin = isEditMode && editingUser && editingUser.id === loggedInSchoolUser?.id && editingUser.role === 'SCHOOL_ADMIN';


  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {isEditMode ? 'Editar Utilizador' : 'Adicionar Novo Utilizador'}
      </Typography>
      
      <TextField
        fullWidth
        margin="normal"
        id="name"
        name="name"
        label="Nome do Utilizador"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        disabled={formik.isSubmitting}
        autoFocus={!isEditMode}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        id="email"
        name="email"
        label="Email do Utilizador"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={formik.isSubmitting || isEditingSelfAsSchoolAdmin} // SCHOOL_ADMIN não pode editar o seu próprio email
        required
        title={isEditingSelfAsSchoolAdmin ? "Email do administrador principal não pode ser alterado." : ""}
      />
      <TextField
        fullWidth
        margin="normal"
        id="password"
        name="password"
        label="Senha"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={(formik.touched.password && formik.errors.password) || (isEditMode ? "Deixe em branco para não alterar. Mín. 6 caracteres se preenchido." : "Mínimo 6 caracteres.")}
        disabled={formik.isSubmitting}
        required={!isEditMode} // Obrigatório apenas na criação
      />
      
      <FormControl fullWidth margin="normal" required error={formik.touched.role && Boolean(formik.errors.role)} disabled={formik.isSubmitting || isEditingSelfAsSchoolAdmin}>
        <InputLabel id="role-select-label">Papel (Role)</InputLabel>
        <Select
          labelId="role-select-label"
          id="role"
          name="role"
          value={formik.values.role}
          label="Papel (Role)"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {assignableRoles.map(r => (
            <MenuItem key={r.value} value={r.value} disabled={r.value === 'SCHOOL_ADMIN' && !isEditingSelfAsSchoolAdmin}>
              {r.label}
            </MenuItem>
          ))}
        </Select>
        {(formik.touched.role && formik.errors.role) && (
          <Typography color="error" variant="caption" sx={{ml: '14px', mt: '3px'}}>{formik.errors.role}</Typography>
        )}
        {isEditingSelfAsSchoolAdmin && (
            <Typography variant="caption" color="textSecondary" sx={{ml: '14px', mt:'3px'}}>O papel do administrador principal não pode ser alterado.</Typography>
        )}
      </FormControl>

      <FormControlLabel
        control={
          <Switch 
            name="isActive"
            checked={formik.values.isActive} 
            onChange={formik.handleChange}
            onBlur={formik.handleBlur} // Adicionado para consistência com touched
            disabled={formik.isSubmitting || (isEditingSelfAsSchoolAdmin && !formik.values.isActive)} // Não pode desativar a si mesmo
          />
        }
        label={formik.values.isActive ? "Utilizador Ativo" : "Utilizador Inativo"}
        sx={{ mt: 1, mb:1 }}
        title={isEditingSelfAsSchoolAdmin && !formik.values.isActive ? "Administrador da escola não pode desativar a si mesmo." : ""}
      />
      {formik.touched.isActive && formik.errors.isActive && ( // Embora o Yup schema não valide isActive, pode ser adicionado
        <Typography color="error" variant="caption" sx={{ml: '14px', mt: '3px'}}>{formik.errors.isActive}</Typography>
      )}


      {apiError && (
        <MuiAlert severity="error" sx={{ width: '100%', mt: 2, mb:1 }}>
          {apiError}
        </MuiAlert>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formik.isSubmitting} color="inherit">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting || !formik.isValid } // Desabilita se o formulário não for válido
          startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {formik.isSubmitting ? (isEditMode ? 'A Atualizar...' : 'A Adicionar...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar Utilizador')}
        </Button>
      </Box>
    </Box>
  );
};

export default SchoolAdminUserForm;