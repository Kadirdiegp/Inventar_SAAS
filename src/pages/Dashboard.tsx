import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  CardActionArea
} from '@mui/material';
import { 
  Inventory as InventoryIcon, 
  Receipt as ReceiptIcon, 
  People as PeopleIcon, 
  TrendingUp as TrendingUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { fetchPartners } from '../services/partnerService';
import { fetchInvoices } from '../services/invoiceService';
import { Invoice } from '../types';

const Dashboard: React.FC = () => {
  // State für Daten
  const [loading, setLoading] = useState(true);
  
  // State für Statistiken
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPartners, setTotalPartners] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Funktion zum Laden der Dashboard-Daten
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Produkte laden
      const productsData = await fetchProducts();
      setTotalProducts(productsData.length);
      
      // Partner laden
      const partnersData = await fetchPartners();
      setTotalPartners(partnersData.length);
      
      // Rechnungen laden
      const invoicesData = await fetchInvoices();
      setTotalInvoices(invoicesData.length);
      
      // Umsatz berechnen
      const revenue = invoicesData.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
      setTotalRevenue(revenue);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  }, []);
  
  // Daten beim ersten Rendering laden
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '70vh'
        }}
      >
        <CircularProgress sx={{ color: '#ffffff' }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Überschrift */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="600" sx={{ color: 'white' }}>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.7 }}>
          Übersicht über Ihre Geschäftskennzahlen
        </Typography>
      </Box>
      
      {/* Aktionsschaltflächen */}
      <Box 
        sx={{ 
          mb: 4,
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Button
          component={Link}
          to="/inventory/add"
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          sx={{
            backgroundColor: '#6200ea',
            '&:hover': { backgroundColor: '#5000d1' },
            borderRadius: '50px',
            py: 1.2,
            px: 3,
            color: 'white'
          }}
        >
          Produkt hinzufügen
        </Button>
        
        <Button
          component={Link}
          to="/invoices/create"
          variant="contained"
          startIcon={<ReceiptIcon />}
          fullWidth={isMobile}
          sx={{
            backgroundColor: '#00c853',
            '&:hover': { backgroundColor: '#00b34a' },
            borderRadius: '50px',
            py: 1.2,
            px: 3,
            color: 'white'
          }}
        >
          Rechnung erstellen
        </Button>
      </Box>
      
      {/* Statistikkarten */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Produktkarte */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/inventory')}
          >
            <CardActionArea sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem', color: 'white' }}>
                    Produkte
                  </Typography>
                  <Box 
                    sx={{ 
                      backgroundColor: 'rgba(128, 90, 213, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <InventoryIcon sx={{ color: '#805AD5' }} />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="600" sx={{ color: 'white' }}>
                  {totalProducts}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Partnerkarte */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/partners')}
          >
            <CardActionArea sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem', color: 'white' }}>
                    Partner
                  </Typography>
                  <Box 
                    sx={{ 
                      backgroundColor: 'rgba(49, 151, 246, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <PeopleIcon sx={{ color: '#3197F6' }} />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="600" sx={{ color: 'white' }}>
                  {totalPartners}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Rechnungskarte */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/invoices')}
          >
            <CardActionArea sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem', color: 'white' }}>
                    Rechnungen
                  </Typography>
                  <Box 
                    sx={{ 
                      backgroundColor: 'rgba(46, 202, 134, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <ReceiptIcon sx={{ color: '#2ECA86' }} />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="600" sx={{ color: 'white' }}>
                  {totalInvoices}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Umsatzkarte */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/finance')}
          >
            <CardActionArea sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem', color: 'white' }}>
                    Umsatz
                  </Typography>
                  <Box 
                    sx={{ 
                      backgroundColor: 'rgba(246, 153, 49, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <TrendingUpIcon sx={{ color: '#F69931' }} />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="600" sx={{ color: 'white' }}>
                  {totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
