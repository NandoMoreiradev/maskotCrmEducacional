import React, { useEffect, useState } from 'react'; // Removido useState para campos individuais
import { useFormik } from 'formik'; // Importe useFormik
import * as Yup from 'yup'; // Importe Yup
import adminSchoolService from '../../services/adminSchoolService';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { TextField, Button, Box, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';

// Esquema de Validação com Yup
const SchoolValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .required('O nome da escola é obrigatório'),
  email: Yup.string()
    .email('Formato de email inválido')
    .required('O email principal é obrigatório'),
  corporateName: Yup.string().nullable(),
  cnpj: Yup.string()
    .nullable()
    .matches(/^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}|\d{14})$/, 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX ou 14 dígitos)')
    .transform(value => value ? value.replace(/[^\d]/g, '') : null) // Remove não dígitos antes de validar tamanho
    .test('len', 'CNPJ deve ter 14 dígitos', value => !value || value.length === 14) // Valida tamanho após remover máscara
    .nullable(),
  phone: Yup.string().nullable(),
  address: Yup.string().nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().max(2, 'UF deve ter no máximo 2 caracteres').nullable(),
  zipCode: Yup.string().nullable(),
  status: Yup.string().required('O status é obrigatório'),
});


const AddSchoolForm = ({ onSuccess, onCancel, editingSchool }) => {
  const { token } = useAdminAuth();
  const isEditMode = !!editingSchool;

  // Estado para erros de API (não cobertos pela validação do Formik)
  const [apiError, setApiError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      corporateName: '',
      cnpj: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'active', // Status padrão
    },
    validationSchema: SchoolValidationSchema,
    enableReinitialize: true, // Permite que o formulário reinicialize quando editingSchool mudar
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError('');
      const schoolData = {
        ...values,
        // Garante que campos opcionais vazios sejam enviados como null se desejado pelo backend
        corporateName: values.corporateName || null,
        cnpj: values.cnpj ? values.cnpj.replace(/[^\d]/g, '') : null, // Envia apenas dígitos para o backend
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        zipCode: values.zipCode || null,
      };

      try {
        let response;
        if (isEditMode && editingSchool) {
          response = await adminSchoolService.updateSchool(editingSchool.id, schoolData, token);
        } else {
          response = await adminSchoolService.createSchool(schoolData, token);
        }
        onSuccess(response.data.school, isEditMode);
        if (!isEditMode) resetForm(); // Limpa o formulário apenas em modo de adição
        // O componente pai (Dashboard) fechará o modal
      } catch (err) {
        console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} escola:`, err);
        const errMsg = err.response?.data?.message || err.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} escola.`;
        setApiError(errMsg); // Exibe erros da API
      } finally {
        setSubmitting(false);
      }
    },
  });

  // useEffect para popular o formulário quando editingSchool mudar (para modo de edição)
  useEffect(() => {
    if (isEditMode && editingSchool) {
      formik.setValues({ // Usa formik.setValues para atualizar todos os campos
        name: editingSchool.name || '',
        email: editingSchool.email || '',
        corporateName: editingSchool.corporateName || '',
        cnpj: editingSchool.cnpj || '', // Formik vai pegar o valor, máscara pode ser aplicada no input
        phone: editingSchool.phone || '',
        address: editingSchool.address || '',
        city: editingSchool.city || '',
        state: editingSchool.state || '',
        zipCode: editingSchool.zipCode || '',
        status: editingSchool.status || 'active',
      });
    } else {
      // Se não for modo de edição, ou se editingSchool for removido,
      // o Formik reseta para initialValues devido ao enableReinitialize ou podemos chamar resetForm
      // formik.resetForm(); // Descomente se quiser resetar explicitamente aqui
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSchool, isEditMode]); // formik.setValues não precisa ser dependência aqui

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {isEditMode ? 'Editar Escola' : 'Adicionar Nova Escola'}
      </Typography>
      
      <TextField
        fullWidth
        margin="normal"
        id="name"
        name="name" // Importante: name deve corresponder à chave em initialValues e schema
        label="Nome da Escola"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur} // Para que o `touched` funcione corretamente
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        disabled={formik.isSubmitting}
        autoFocus={!isEditMode}
        required // Indicação visual, a validação real é pelo Yup
      />
      <TextField
        fullWidth
        margin="normal"
        id="email"
        name="email"
        label="Email Principal"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={formik.isSubmitting}
        required
      />
      
      <FormControl fullWidth margin="normal" required error={formik.touched.status && Boolean(formik.errors.status)} disabled={formik.isSubmitting}>
        <InputLabel id="status-select-label">Status</InputLabel>
        <Select
          labelId="status-select-label"
          id="status"
          name="status"
          value={formik.values.status}
          label="Status"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <MenuItem value="active">Ativa</MenuItem>
          <MenuItem value="inactive">Inativa</MenuItem>
          <MenuItem value="pending">Pendente</MenuItem>
          <MenuItem value="trial">Teste</MenuItem>
        </Select>
        {formik.touched.status && formik.errors.status && (
          <Typography color="error" variant="caption" sx={{ml: '14px', mt: '3px'}}>{formik.errors.status}</Typography>
        )}
      </FormControl>
      
      <TextField fullWidth margin="normal" id="corporateName" name="corporateName" label="Razão Social" value={formik.values.corporateName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.corporateName && Boolean(formik.errors.corporateName)} helperText={formik.touched.corporateName && formik.errors.corporateName} disabled={formik.isSubmitting}/>
      <TextField fullWidth margin="normal" id="cnpj" name="cnpj" label="CNPJ (XX.XXX.XXX/XXXX-XX)" value={formik.values.cnpj} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.cnpj && Boolean(formik.errors.cnpj)} helperText={formik.touched.cnpj && formik.errors.cnpj} disabled={formik.isSubmitting}/>
      <TextField fullWidth margin="normal" id="phone" name="phone" label="Telefone" type="tel" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.phone && Boolean(formik.errors.phone)} helperText={formik.touched.phone && formik.errors.phone} disabled={formik.isSubmitting}/>
      {/* Adicionar mais TextFields para endereço, cidade, estado, cep, todos seguindo o mesmo padrão com formik.values, formik.handleChange, formik.errors, etc. */}

      {apiError && ( // Erros que vêm da API após a submissão
        <Alert severity="error" sx={{ width: '100%', mt: 2, mb:1 }}>
          {apiError}
        </Alert>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formik.isSubmitting} color="inherit">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting || !formik.isValid} // Desabilita se estiver submetendo ou se o formulário for inválido
          startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {formik.isSubmitting ? (isEditMode ? 'A Atualizar...' : 'A Adicionar...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar Escola')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddSchoolForm;