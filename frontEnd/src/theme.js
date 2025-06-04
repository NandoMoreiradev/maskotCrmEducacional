import { createTheme } from '@mui/material/styles';

// Cores da Marca Maskot CRM Educacional
const maskotPalette = {
  primary: {
    main: '#3b4178', // Azul escuro/índigo
    // light: '#666ba7', (pode ser gerado automaticamente ou definido)
    // dark: '#0d1a4b',  (pode ser gerado automaticamente ou definido)
    // contrastText: '#ffffff', (cor do texto sobre a cor primária)
  },
  secondary: {
    main: '#ef4342', // Vermelho/coral
    // contrastText: '#ffffff',
  },
  background: {
    default: '#f4f6f8', // Um cinza muito claro para o fundo geral
    paper: '#ffffff',   // Cor de fundo para componentes como Cards, Modais
  },
  neutral: { // Cor neutra que você forneceu
    main: '#d2d2d1', // Cinza claro
  },
  // Você pode adicionar mais cores personalizadas ou ajustar tons aqui
};

const theme = createTheme({
  palette: {
    primary: maskotPalette.primary,
    secondary: maskotPalette.secondary,
    background: maskotPalette.background,
    grey: { // Usando a cor neutra para tons de cinza do MUI, se desejar
      200: maskotPalette.neutral.main, // Exemplo de uso
      // ... outros tons de cinza
    },
    // Exemplo de como adicionar a cor neutra diretamente se não quiser sobrescrever 'grey'
    // maskotNeutral: {
    //   main: maskotPalette.neutral.main,
    //   contrastText: '#000000'
    // }
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', // Mantendo a fonte base
    // Você pode customizar variantes de tipografia aqui (h1, h2, body1, etc.)
  },
  // Você pode customizar espaçamentos, breakpoints, formato de componentes, etc.
  // shape: {
  //   borderRadius: 8,
  // },
});

export default theme;