import React from 'react';
import { Container, Box, Paper } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: '#000000'
      }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 0,
            backgroundColor: '#000000',
            color: '#ffffff'
          }}
        >
          {children}
        </Box>
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          textAlign: 'center', 
          backgroundColor: '#000000',
          color: '#ffffff',
          mt: 'auto' 
        }}
      >
        Inventar & Rechnungsverwaltung © {new Date().getFullYear()}
      </Box>
    </Box>
  );
};

export default Layout;
