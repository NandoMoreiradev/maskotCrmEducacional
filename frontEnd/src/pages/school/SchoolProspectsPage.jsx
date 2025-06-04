import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSchoolAuth } from '../../contexts/SchoolAuthContext';
import schoolAppService from '../../services/schoolAppService';
import {
    Box, Typography, Button, CircularProgress, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Alert as MuiAlert,
    TablePagination, TableSortLabel, Tooltip, Skeleton, Link as MuiLink, Breadcrumbs
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Link as RouterLink } from 'react-router-dom'; // Para Breadcrumbs
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// Adicionar mais ícones se necessário

// Funções de ordenação (podem ser movidas para utils.js)
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

const prospectHeadCells = [
  { id: 'studentName', label: 'Nome do Aluno', sortable: true },
  { id: 'guardianName', label: 'Responsável', sortable: true },
  { id: 'guardianEmail', label: 'Email Resp.', sortable: true },
  { id: 'guardianPhone', label: 'Telefone Resp.', sortable: true },
  { id: 'gradeOfInterest', label: 'Série de Interesse', sortable: true },
  { id: 'status', label: 'Status Funil', sortable: true },
  { id: 'source', label: 'Origem', sortable: true },
  { id: 'updatedAt', label: 'Última Atualização', sortable: true },
  { id: 'actions', label: 'Ações', sortable: false, align: 'right' },
];

const SchoolProspectsPage = () => {
  const { schoolUser, schoolToken } = useSchoolAuth();
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Mais linhas por página para prospects
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('updatedAt'); // Ordenar por mais recente por padrão

  // TODO: Adicionar estados para Snackbar, Modais de formulário e exclusão

  const fetchProspects = useCallback(async () => {
    if (!schoolToken) {
      setPageError("Autenticação necessária.");
      return;
    }
    setIsLoading(true);
    setPageError('');
    try {
      // await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      const response = await schoolAppService.listMySchoolProspects(schoolToken);
      setProspects(response.data);
    } catch (err) {
      console.error("Erro ao buscar prospects:", err);
      const errMsg = err.response?.data?.message || err.message || "Falha ao buscar prospects.";
      setPageError(errMsg);
      // TODO: showSnackbar(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [schoolToken]);

  useEffect(() => {
    if (schoolUser?.schoolId && schoolToken) {
      fetchProspects();
    }
  }, [fetchProspects, schoolUser, schoolToken]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const visibleProspects = useMemo(() => {
    if (!prospects || prospects.length === 0) return [];
    const sortedProspects = stableSort(prospects, getComparator(order, orderBy));
    if (rowsPerPage === -1) return sortedProspects;
    return sortedProspects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [prospects, order, orderBy, page, rowsPerPage]);

  const handleOpenAddProspectModal = () => {
    alert("Funcionalidade 'Adicionar Novo Prospecto' a ser implementada aqui.");
    // TODO: setOpenAddProspectModal(true);
  };
  
  const handleEditProspect = (prospectId) => alert(`Editar prospecto ID: ${prospectId} (a implementar)`);
  const handleDeleteProspect = (prospectId) => alert(`Excluir prospecto ID: ${prospectId} (a implementar)`);

  if (!schoolUser) {
    return <Box sx={{p:3}}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} underline="hover" color="inherit" to="/school/dashboard">
          Painel da Escola
        </MuiLink>
        <Typography color="text.primary">Gestão de Prospects</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Prospects
        </Typography>
        <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddProspectModal}>
          Adicionar Prospecto
        </Button>
      </Box>

      {pageError && <MuiAlert severity="error" sx={{ mb: 2 }}>{pageError}</MuiAlert>}

      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
        <TableContainer>
          <Table stickyHeader aria-label="tabela de prospects">
            <TableHead>
              <TableRow>
                {prospectHeadCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={orderBy === headCell.id ? order : false} sx={{ fontWeight: 'bold' }}>
                    {headCell.sortable !== false ? (
                      <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={(e) => handleRequestSort(e, headCell.id)}>
                        {headCell.label}
                        {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'desc' : 'asc'}</Box>) : null}
                      </TableSortLabel>
                    ) : headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(rowsPerPage > 0 ? rowsPerPage : 5)).map((_, index) => (
                  <TableRow key={`skeleton-prospect-${index}`}>
                    {prospectHeadCells.map(hc => <TableCell key={`${hc.id}-skel`}><Skeleton animation="wave" height={40}/></TableCell>)}
                  </TableRow>
                ))
              ) : visibleProspects.length > 0 ? (
                visibleProspects.map((prospect) => (
                  <TableRow hover key={prospect.id}>
                    <TableCell>{prospect.studentName}</TableCell>
                    <TableCell>{prospect.guardianName || 'N/A'}</TableCell>
                    <TableCell>{prospect.guardianEmail || 'N/A'}</TableCell>
                    <TableCell>{prospect.guardianPhone || 'N/A'}</TableCell>
                    <TableCell>{prospect.gradeOfInterest || 'N/A'}</TableCell>
                    <TableCell>{prospect.status}</TableCell>
                    <TableCell>{prospect.source || 'N/A'}</TableCell>
                    <TableCell>{new Date(prospect.updatedAt).toLocaleString('pt-BR')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar Prospecto"><IconButton onClick={() => handleEditProspect(prospect.id)} color="primary" size="small" disabled><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Excluir Prospecto"><IconButton onClick={() => handleDeleteProspect(prospect.id)} color="error" size="small" disabled><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={prospectHeadCells.length} align="center" sx={{ py:3 }}>
                    Nenhum prospecto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!isLoading && prospects.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, { label: 'Todos', value: -1 }]}
            component="div"
            count={prospects.length} // TODO: Ajustar para `filteredProspects.length` se adicionar filtro
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Prospects por página:"
          />
        )}
      </Paper>
      {/* Modais para adicionar/editar e excluir prospects serão adicionados aqui */}
      {/* Snackbar para notificações */}
    </Box>
  );
};

export default SchoolProspectsPage;