import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminSchoolService from '../../services/adminSchoolService';
import AddSchoolForm from '../../components/admin/AddSchoolForm';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink

// Imports do MUI
import { 
    Box, Button, Typography, CircularProgress, Paper, Alert as MuiAlert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide,
    Snackbar,
    TablePagination,
    TableSortLabel,
    TextField, Tooltip, // Adicionado Tooltip
    Skeleton // Adicionado Skeleton
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // Ícone para gerir utilizadores

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
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
  } else {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
  }
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, label: 'Nome', sortable: true },
  { id: 'email', numeric: false, label: 'Email', sortable: true },
  { id: 'status', numeric: false, label: 'Status', sortable: true },
  { id: 'cnpj', numeric: false, label: 'CNPJ', sortable: true },
  // { id: 'phone', numeric: false, label: 'Telefone', sortable: true }, // Removido para simplificar, pode adicionar de volta
  { id: 'users', numeric: false, label: 'Utilizadores', sortable: false, align: 'center' }, // Nova Coluna
  { id: 'actions', numeric: false, label: 'Ações Escola', sortable: false, align: 'right' },
];

const AdminDashboardPage = () => {
  const { admin, token } = useAdminAuth(); // Removido logoutAdmin, pois está na AppBar do App.jsx
  const [schools, setSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [pageError, setPageError] = useState('');
  const [openSchoolFormModal, setOpenSchoolFormModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [schoolToDeleteId, setSchoolToDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc'); 
  const [orderBy, setOrderBy] = useState('name'); 
  const [searchTerm, setSearchTerm] = useState('');

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const fetchSchools = useCallback(async () => {
    if (!token) { setPageError("Autenticação necessária."); return; }
    setIsLoadingSchools(true); setPageError('');
    try {
      const response = await adminSchoolService.getAllSchools(token);
      setSchools(response.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao buscar escolas.";
      setPageError(errMsg); showSnackbar(errMsg, 'error');
    } finally { setIsLoadingSchools(false); }
  }, [token]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);
  useEffect(() => { setPage(0); }, [searchTerm, rowsPerPage]);

  const handleFormSuccess = (updatedOrNewSchool, isEdit) => {
    fetchSchools(); 
    showSnackbar(isEdit ? 'Escola atualizada!' : 'Escola adicionada!', 'success');
    setOpenSchoolFormModal(false); setEditingSchool(null);
  };
  const handleOpenAddModal = () => { setEditingSchool(null); setOpenSchoolFormModal(true); };
  const handleOpenEditModal = (schoolToEdit) => { setEditingSchool(schoolToEdit); setOpenSchoolFormModal(true); };
  const handleCloseModal = () => { setOpenSchoolFormModal(false); setEditingSchool(null); };
  const handleOpenDeleteConfirmDialog = (id) => { setSchoolToDeleteId(id); setOpenDeleteConfirmDialog(true); };
  const handleCloseDeleteConfirmDialog = () => { setSchoolToDeleteId(null); setOpenDeleteConfirmDialog(false); };

  const handleConfirmDelete = async () => {
    if (!token || !schoolToDeleteId) { showSnackbar("Erro: ID/Token não encontrado.", "error"); handleCloseDeleteConfirmDialog(); return; }
    try {
      await adminSchoolService.deleteSchool(schoolToDeleteId, token);
      fetchSchools(); showSnackbar('Escola excluída!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Falha ao excluir.";
      showSnackbar(errMsg, 'error');
    } finally { handleCloseDeleteConfirmDialog(); }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property);
  };
  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const filteredAndSortedSchools = useMemo(() => {
    if (!schools) return [];
    let processableSchools = [...schools];
    if (searchTerm) {
      processableSchools = processableSchools.filter(school => {
        const term = searchTerm.toLowerCase();
        return ['name', 'email', 'cnpj', 'status'].some(field => 
            school[field] && school[field].toString().toLowerCase().includes(term)
        );
      });
    }
    return stableSort(processableSchools, getComparator(order, orderBy));
  }, [schools, order, orderBy, searchTerm]);
  
  const visibleSchools = useMemo(() => {
    if (rowsPerPage === -1) return filteredAndSortedSchools;
    return filteredAndSortedSchools.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedSchools, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Dashboard de Escolas</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddModal}>Adicionar Escola</Button>
      </Box>
      {admin && <Typography variant="subtitle1" gutterBottom>Bem-vindo(a), {admin.name}!</Typography>}
      <Box sx={{ my: 2 }}>
        <TextField fullWidth variant="outlined" label="Buscar Escolas (Nome, Email, CNPJ, Status)" value={searchTerm} onChange={handleSearchChange} InputProps={{startAdornment: (<SearchIcon sx={{ mr: 1, color: 'action.active' }} />)}}/>
      </Box>
      {pageError && <MuiAlert severity="error" sx={{ mb: 2 }}>{pageError}</MuiAlert>}
      {isLoadingSchools ? (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
            <TableContainer><Table><TableHead><TableRow>
                {headCells.map(hc => <TableCell key={hc.id} sx={{fontWeight: 'bold'}} align={hc.align || (hc.numeric ? 'right' : 'left')}>{hc.label}</TableCell>)}
            </TableRow></TableHead><TableBody>
            {Array.from(new Array(rowsPerPage > 0 ? rowsPerPage : 3)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                {headCells.map(hc => <TableCell key={`${hc.id}-skel-${index}`}><Skeleton animation="wave" height={40}/></TableCell>)}
                </TableRow>))}
            </TableBody></Table></TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
          <TableContainer>
            <Table stickyHeader aria-label="tabela de escolas">
              <TableHead><TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.align || (headCell.numeric ? 'right' : 'left')} padding={headCell.disablePadding ? 'none' : 'normal'} sortDirection={orderBy === headCell.id ? order : false} sx={{ fontWeight: 'bold' }}>
                    {headCell.sortable !== false ? (
                      <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={(event) => handleRequestSort(event, headCell.id)}>
                        {headCell.label}
                        {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'desc' : 'asc'}</Box>) : null}
                      </TableSortLabel>
                    ) : ( headCell.label )}
                  </TableCell>))}
              </TableRow></TableHead>
              <TableBody>
                {visibleSchools.length > 0 ? (
                  visibleSchools.map((school) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={school.id}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.email}</TableCell>
                      <TableCell>{school.status}</TableCell>
                      <TableCell>{school.cnpj || 'N/A'}</TableCell>
                      {/* <TableCell>{school.phone || 'N/A'}</TableCell> */}
                      <TableCell align="center"> {/* Célula para Gerir Utilizadores */}
                        <Tooltip title="Gerir Utilizadores da Escola">
                          <IconButton component={RouterLink} to={`/admin/schools/${school.id}/users`} color="default" size="small">
                            <ManageAccountsIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right"> {/* Célula para Ações da Escola */}
                        <Tooltip title="Editar Escola"><IconButton onClick={() => handleOpenEditModal(school)} color="primary" size="small"><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Excluir Escola"><IconButton onClick={() => handleOpenDeleteConfirmDialog(school.id)} color="error" size="small"><DeleteIcon /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : ( <TableRow><TableCell colSpan={headCells.length} align="center" sx={{ py:3 }}>Nenhuma escola encontrada com os critérios atuais.</TableCell></TableRow> )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredAndSortedSchools.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'Todas', value: -1 }]}
              component="div" count={filteredAndSortedSchools.length}
              rowsPerPage={rowsPerPage} page={page}
              onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      )}
      <Dialog open={openSchoolFormModal} TransitionComponent={Transition} keepMounted onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchool ? 'Editar Escola' : 'Adicionar Nova Escola'}</DialogTitle>
        <DialogContent><AddSchoolForm onSuccess={handleFormSuccess} onCancel={handleCloseModal} editingSchool={editingSchool}/></DialogContent>
      </Dialog>
      <Dialog open={openDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={handleCloseDeleteConfirmDialog}>Cancelar</Button><Button onClick={handleConfirmDelete} color="error" autoFocus>Excluir</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <SnackbarAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</SnackbarAlert>
      </Snackbar>
    </Box>
  );
};
export default AdminDashboardPage;