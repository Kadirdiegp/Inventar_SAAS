import React from 'react';
import { Container, Box, Paper } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {children}
        </Paper>
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5',
          mt: 'auto' 
        }}
      >
        Inventar & Rechnungsverwaltung © {new Date().getFullYear()}
      </Box>
    </Box>
  );
};

export default Layout;
