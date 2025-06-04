import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSchoolAuth } from '../../contexts/SchoolAuthContext';
import schoolAppService from '../../services/schoolAppService';
import SchoolAdminUserForm from '../../components/school/SchoolAdminUserForm'; // Importe o formulário
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Alert as MuiAlert,
    TablePagination, TableSortLabel, Tooltip, Skeleton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide as MuiSlide, Snackbar
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';


const TransitionDialog = React.forwardRef(function Transition(props, ref) {
  return <MuiSlide direction="up" ref={ref} {...props} />;
});
const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function descendingComparator(a, b, orderBy) { 
  const valA = a[orderBy] === null || typeof a[orderBy] === 'undefined' ? '' : String(a[orderBy]);
  const valB = b[orderBy] === null || typeof b[orderBy] === 'undefined' ? '' : String(b[orderBy]);
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

const userHeadCellsForSchoolAdmin = [ 
  { id: 'name', label: 'Nome', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'role', label: 'Papel', sortable: true },
  { id: 'isActive', label: 'Status', sortable: true },
  { id: 'actions', label: 'Ações', sortable: false, align: 'right' },
];

const SchoolAdminDashboard = () => {
  const { schoolUser, schoolToken } = useSchoolAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [pageError, setPageError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const [openUserFormModal, setOpenUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Guarda o objeto user para edição
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Guarda o objeto user para o dialog de exclusão

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = (message, severity = 'success') => { setSnackbarMessage(message); setSnackbarSeverity(severity); setSnackbarOpen(true); };
  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbarOpen(false);};

  const fetchMySchoolUsers = useCallback(async () => {
    if (!schoolToken) { setPageError("Autenticação necessária."); return; }
    if (!schoolUser?.schoolId) { setPageError("ID da escola não identificado."); setIsLoadingUsers(false); return; }
    
    setIsLoadingUsers(true); setPageError('');
    try {
      const response = await schoolAppService.listMySchoolUsers(schoolToken);
      setUsers(response.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao buscar utilizadores.";
      setPageError(errMsg); showSnackbar(errMsg, 'error');
    } finally { setIsLoadingUsers(false); }
  }, [schoolToken, schoolUser?.schoolId]);

  useEffect(() => { 
    if (schoolUser?.schoolId && schoolToken) {
        fetchMySchoolUsers(); 
    }
  }, [fetchMySchoolUsers, schoolUser, schoolToken]);

  const handleUserFormSuccess = (processedUser, isEditMode) => {
    fetchMySchoolUsers(); 
    showSnackbar(isEditMode ? 'Utilizador atualizado com sucesso!' : 'Utilizador adicionado com sucesso!', 'success');
    setOpenUserFormModal(false); setEditingUser(null);
  };

  const handleOpenAddUserModal = () => { setEditingUser(null); setOpenUserFormModal(true); };
  const handleOpenEditUserModal = (userToEdit) => { setEditingUser(userToEdit); setOpenUserFormModal(true); };
  const handleCloseUserFormModal = () => { setOpenUserFormModal(false); setEditingUser(null); };

  const handleOpenDeleteUserDialog = (user) => { setUserToDelete(user); setOpenDeleteUserDialog(true); };
  const handleCloseDeleteUserDialog = () => { setUserToDelete(null); setOpenDeleteUserDialog(false); };

  const handleConfirmDeleteUser = async () => {
    if (!schoolToken || !userToDelete?.id) { showSnackbar("Erro nos dados para exclusão.", "error"); handleCloseDeleteUserDialog(); return; }
    if (userToDelete.id === schoolUser?.id) { // SCHOOL_ADMIN não pode excluir a si mesmo
        showSnackbar("Não pode excluir a sua própria conta de administrador.", "error");
        handleCloseDeleteUserDialog();
        return;
    }
    try {
      await schoolAppService.deleteMySchoolUser(userToDelete.id, schoolToken);
      fetchMySchoolUsers(); 
      showSnackbar(`Utilizador "${userToDelete.name}" excluído com sucesso!`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao excluir utilizador.";
      showSnackbar(errMsg, 'error');
    } finally { handleCloseDeleteUserDialog(); }
  };
  
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleRequestSort = (event, property) => { const isAsc = orderBy === property && order === 'asc'; setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); };

  const visibleUsers = useMemo(() => { 
    if (!users || users.length === 0) return [];
    const sortedUsers = stableSort(users, getComparator(order, orderBy));
    if (rowsPerPage === -1) return sortedUsers;
    return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [users, order, orderBy, page, rowsPerPage]);

  if (!schoolUser || !schoolUser.schoolId) { 
    return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)', p:3 }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>A carregar dados do utilizador da escola...</Typography> </Box> );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel da Escola
      </Typography>
    // ... (Boas-vindas ao utilizador) ...
      <Typography variant="h4" component="h1" gutterBottom>Painel da Escola</Typography>
      <Typography variant="h6" gutterBottom>Gestão de Utilizadores</Typography>
      <Typography variant="subtitle1" gutterBottom>Bem-vindo(a), {schoolUser.name} ({schoolUser.role})</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
        <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddUserModal}>Adicionar Novo Utilizador</Button>
      </Box>
      {pageError && !isLoadingUsers && <MuiAlert severity="error" sx={{ mb: 2 }}>{pageError}</MuiAlert>}
      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
        <Typography variant="h6">Gestão de Leads/Prospects</Typography>
        <Button
          component={RouterLink}
          to="/school/prospects" // <<< Este é o ponto crucial
          variant="contained"
          sx={{ mt: 1 }}
          startIcon={<GroupAddIcon />}
        >
          Gerir Prospects
        </Button>
        <TableContainer>
          <Table stickyHeader>
            <TableHead><TableRow>
              {userHeadCellsForSchoolAdmin.map((hc) => (
                <TableCell key={hc.id} align={hc.align || 'left'} sortDirection={orderBy === hc.id ? order : false} sx={{ fontWeight: 'bold' }}>
                  {hc.sortable !== false ? (<TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'} onClick={(e) => handleRequestSort(e, hc.id)}>{hc.label}{orderBy === hc.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'desc' : 'asc'}</Box>) : null}</TableSortLabel>) : hc.label}
                </TableCell>))}
            </TableRow></TableHead>
            <TableBody>
              {isLoadingUsers ? ( Array.from(new Array(rowsPerPage > 0 ? rowsPerPage : 3)).map((_, i) => (<TableRow key={`skel-${i}`}>{userHeadCellsForSchoolAdmin.map(hc => <TableCell key={`${hc.id}-skel-${i}`}><Skeleton/></TableCell>)}</TableRow>))
              ) : visibleUsers.length > 0 ? (
                visibleUsers.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell><Typography sx={{color:user.isActive ? 'success.main':'error.main', fontWeight:'medium'}}>{user.isActive ? 'Ativo' : 'Inativo'}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar Utilizador"><IconButton onClick={() => handleOpenEditUserModal(user)} color="primary" size="small" 
                        // SCHOOL_ADMIN não pode editar a si mesmo se for o único SCHOOL_ADMIN (lógica mais complexa)
                        // ou se o backend já impõe restrições, podemos simplificar aqui.
                        // Por agora, desabilitamos a edição do próprio SCHOOL_ADMIN logado.
                        disabled={user.id === schoolUser.id && user.role === 'SCHOOL_ADMIN'}
                      ><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Excluir Utilizador"><IconButton onClick={() => handleOpenDeleteUserDialog(user)} color="error" size="small" 
                        disabled={user.id === schoolUser.id} // SCHOOL_ADMIN não pode excluir a si mesmo
                      ><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( <TableRow><TableCell colSpan={userHeadCellsForSchoolAdmin.length} align="center" sx={{py:3}}>Nenhum utilizador encontrado para esta escola.</TableCell></TableRow> )}
            </TableBody>
          </Table>
        </TableContainer>
        {!isLoadingUsers && users.length > 0 && (
          <TablePagination rowsPerPageOptions={[5,10,25,{label:'Todos',value:-1}]} component="div" count={users.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
        )}
      </Paper>
      <Dialog open={openUserFormModal} TransitionComponent={TransitionDialog} keepMounted onClose={handleCloseUserFormModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Utilizador' : `Adicionar Utilizador à Escola`}</DialogTitle>
        <DialogContent><SchoolAdminUserForm onSuccess={handleUserFormSuccess} onCancel={handleCloseUserFormModal} editingUser={editingUser}/></DialogContent>
      </Dialog>
      <Dialog open={openDeleteUserDialog} onClose={handleCloseDeleteUserDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir o utilizador "{userToDelete?.name || ''}"?</DialogContentText></DialogContent>
        <DialogActions><Button onClick={handleCloseDeleteUserDialog}>Cancelar</Button><Button onClick={handleConfirmDeleteUser} color="error" autoFocus>Excluir</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{vertical:'bottom',horizontal:'center'}}><SnackbarAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{width:'100%'}}>{snackbarMessage}</SnackbarAlert></Snackbar>
    </Box>
  );
};
export default SchoolAdminDashboard;