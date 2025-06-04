import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Adicione useMemo
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminSchoolService from '../../services/adminSchoolService';
import AddSchoolUserForm from '../../components/admin/AddSchoolUserForm';
import {
    Box, Typography, Button, CircularProgress, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Alert as MuiAlert,
    Breadcrumbs, Link, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText,
    Slide as MuiSlide, Snackbar, TablePagination, TableSortLabel, Tooltip // Adicione TableSortLabel e Tooltip
} from '@mui/material';
import { visuallyHidden } from '@mui/utils'; // Para acessibilidade da ordenação
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TransitionDialog = React.forwardRef(function Transition(props, ref) {
  return <MuiSlide direction="up" ref={ref} {...props} />;
});
const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Funções de ordenação (copiadas do AdminDashboardPage, podem ser movidas para utils)
function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] === null || typeof a[orderBy] === 'undefined' ? '' : a[orderBy];
  const valB = b[orderBy] === null || typeof b[orderBy] === 'undefined' ? '' : b[orderBy];
  if (typeof valA === 'string' && typeof valB === 'string') {
    if (valB.toLowerCase() < valA.toLowerCase()) return -1;
    if (valB.toLowerCase() > valA.toLowerCase()) return 1;
  } else { if (valB < valA) return -1; if (valB > valA) return 1; } return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => { const order = comparator(a[0], b[0]); if (order !== 0) return order; return a[1] - b[1]; });
  return stabilizedThis.map((el) => el[0]);
}

const userHeadCells = [
  { id: 'name', label: 'Nome' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Papel (Role)' },
  { id: 'isActive', label: 'Status' },
  { id: 'actions', label: 'Ações', sortable: false, align: 'right' },
];

const SchoolUsersPage = () => {
  const { schoolId } = useParams();
  const { token } = useAdminAuth();
  const [school, setSchool] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [openUserFormModal, setOpenUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Estados para Paginação e Ordenação de Utilizadores
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const showSnackbar = (message, severity = 'success') => { /* ... como antes ... */ setSnackbarMessage(message); setSnackbarSeverity(severity); setSnackbarOpen(true); };
  const handleSnackbarClose = (event, reason) => { /* ... como antes ... */ if (reason === 'clickaway') return; setSnackbarOpen(false);};

  const fetchSchoolDetailsAndUsers = useCallback(async () => {
    if (!token || !schoolId) { setError("ID da escola ou token não fornecido."); return; }
    setIsLoading(true); setError('');
    try {
      const schoolDetailsResponse = await adminSchoolService.getSchoolById(schoolId, token);
      setSchool(schoolDetailsResponse.data);
      const usersResponse = await adminSchoolService.getUsersForSchool(schoolId, token);
      setUsers(usersResponse.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao buscar dados.";
      setError(errMsg); showSnackbar(errMsg, 'error');
    } finally { setIsLoading(false); }
  }, [schoolId, token]);

  useEffect(() => { fetchSchoolDetailsAndUsers(); }, [fetchSchoolDetailsAndUsers]);

  const handleFormSuccess = (updatedOrNewUser, isEdit) => {
    fetchSchoolDetailsAndUsers(); // Rebusca para garantir consistência
    showSnackbar(isEdit ? 'Utilizador atualizado!' : 'Utilizador adicionado!', 'success');
    setOpenUserFormModal(false); setEditingUser(null);
  };

  const handleOpenAddUserModal = () => { setEditingUser(null); setOpenUserFormModal(true); };
  const handleOpenEditUserModal = (userToEdit) => { setEditingUser(userToEdit); setOpenUserFormModal(true); };
  const handleCloseUserFormModal = () => { setOpenUserFormModal(false); setEditingUser(null); };

  const handleOpenDeleteUserDialog = (id) => { setUserToDeleteId(id); setOpenDeleteUserDialog(true); };
  const handleCloseDeleteUserDialog = () => { setUserToDeleteId(null); setOpenDeleteUserDialog(false); };

  const handleConfirmDeleteUser = async () => {
    if (!token || !userToDeleteId || !schoolId) { showSnackbar("Erro nos dados para exclusão.", "error"); handleCloseDeleteUserDialog(); return; }
    try {
      await adminSchoolService.deleteUserForSchool(schoolId, userToDeleteId, token);
      fetchSchoolDetailsAndUsers(); // Rebusca
      showSnackbar('Utilizador excluído com sucesso!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao excluir utilizador.";
      showSnackbar(errMsg, 'error');
    } finally { handleCloseDeleteUserDialog(); }
  };

  // Handlers para Paginação e Ordenação de Utilizadores
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property);
  };

  const visibleUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    const sortedUsers = stableSort(users, getComparator(order, orderBy));
    if (rowsPerPage === -1) return sortedUsers;
    return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [users, order, orderBy, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/admin/dashboard">Dashboard Admin</Link>
        <Typography color="text.primary">Utilizadores {school ? `(${school.name})` : ''}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1">Gerir Utilizadores {school ? `- ${school.name}` : ''}</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddUserModal}>Adicionar Utilizador</Button>
      </Box>
      {error && !isLoading && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
      ) : users.length === 0 && !isLoading ? (
        <Typography sx={{ mt: 2 }}>Nenhum utilizador encontrado para esta escola.</Typography>
      ) : (
        !isLoading && users.length > 0 && (
          <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead><TableRow>
                  {userHeadCells.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={orderBy === headCell.id ? order : false} sx={{ fontWeight: 'bold' }}>
                      {headCell.sortable !== false ? (
                        <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={(e) => handleRequestSort(e, headCell.id)}>
                          {headCell.label}
                          {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'desc' : 'asc'}</Box>) : null}
                        </TableSortLabel>
                      ) : headCell.label}
                    </TableCell>))}
                </TableRow></TableHead>
                <TableBody>
                  {visibleUsers.map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell><Typography sx={{ color: user.isActive ? 'green' : 'red', fontWeight: 'bold' }}>{user.isActive ? 'Ativo' : 'Inativo'}</Typography></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar Utilizador"><IconButton onClick={() => handleOpenEditUserModal(user)} color="primary" size="small"><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Excluir Utilizador"><IconButton onClick={() => handleOpenDeleteUserDialog(user.id)} color="error" size="small"><DeleteIcon /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'Todos', value: -1 }]}
              component="div" count={users.length} rowsPerPage={rowsPerPage} page={page}
              onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )
      )}
      <Dialog open={openUserFormModal} TransitionComponent={TransitionDialog} keepMounted onClose={handleCloseUserFormModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Utilizador' : `Adicionar Utilizador à Escola ${school?.name || ''}`}</DialogTitle>
        <DialogContent>
          <AddSchoolUserForm schoolId={schoolId} onSuccess={handleFormSuccess} onCancel={handleCloseUserFormModal} editingUser={editingUser} />
        </DialogContent>
      </Dialog>
      <Dialog open={openDeleteUserDialog} onClose={handleCloseDeleteUserDialog}>
        <DialogTitle>Confirmar Exclusão de Utilizador</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir este utilizador? Esta ação não pode ser desfeita.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={handleCloseDeleteUserDialog}>Cancelar</Button><Button onClick={handleConfirmDeleteUser} color="error" autoFocus>Excluir</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <SnackbarAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</SnackbarAlert>
      </Snackbar>
    </Box>
  );
};
export default SchoolUsersPage;