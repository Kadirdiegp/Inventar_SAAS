import React from 'react';
import { Container, Box, Typography, Link } from '@mui/material';
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
      <Container maxWidth="lg" sx={{ 
        mt: { xs: 2, sm: 3 }, 
        mb: { xs: 2, sm: 3 }, 
        flexGrow: 1,
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ color: '#ffffff' }}>
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
        <Typography variant="body2" color="text.secondary" sx={{ color: '#9e9e9e' }}>
          Inventar & Rechnungsverwaltung {new Date().getFullYear()} | 
          <span style={{ marginLeft: '6px' }}>
            Entwickelt von <Link href="https://github.com/Kadirdiegp" target="_blank" rel="noopener" sx={{ color: '#29b6f6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Kadir Diego Padin Rodriguez
            </Link>
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
