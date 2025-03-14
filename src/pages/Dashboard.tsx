import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Inventory as InventoryIcon, 
  Receipt as ReceiptIcon, 
  People as PeopleIcon, 
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon, 
  ListAlt as ListAltIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import { fetchProducts } from '../services/productService';
import { fetchPartners } from '../services/partnerService';
import { fetchInvoices, fetchInvoiceItems } from '../services/invoiceService';
import { Product, Partner, Invoice, InvoiceItem } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  // Custom styles for dashboard components
  const styles = {
    root: {
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: '24px',
    },
    statsCard: {
      height: '100%',
      borderRadius: '0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
    },
    chartContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: '0',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '24px',
      color: '#ffffff',
    },
    actionButton: {
      borderRadius: '8px',
      textTransform: 'none',
      padding: '8px 16px',
      margin: '4px',
      boxShadow: 'none',
    },
    tableContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: '0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginTop: '24px',
      color: '#ffffff',
    },
  };
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPartners, setTotalPartners] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [partnerPurchases, setPartnerPurchases] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<number>>(Array(6).fill(0));
  const [monthlyCosts, setMonthlyCosts] = useState<Array<number>>(Array(6).fill(0));
  const [loading, setLoading] = useState(true);

  const handleAddProduct = () => {
    navigate('/inventory/add');
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const handleManagePartners = () => {
    navigate('/partners');
  };

  const handleViewInventory = () => {
    navigate('/inventory');
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, partners, invoices, invoiceItems] = await Promise.all([
        fetchProducts(),
        fetchPartners(),
        fetchInvoices(),
        fetchInvoiceItems()
      ]);

      setTotalProducts(products.length);
      setTotalPartners(partners.length);
      setTotalInvoices(invoices.length);
      
      // Calculate total revenue
      const revenue = invoices.reduce((sum: number, invoice: Invoice) => sum + invoice.total, 0);
      setTotalRevenue(revenue);
      
      // Get low stock products (less than 5 items)
      const lowStock = products
        .filter((product: Product) => product.stock < 5)
        .sort((a: Product, b: Product) => a.stock - b.stock)
        .slice(0, 5);
      setLowStockProducts(lowStock);
      
      // Get recent invoices with partner names
      const recent = [...invoices]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((invoice: Invoice) => {
          // Ensure partner name is set
          if (!invoice.partnerName && invoice.partnerId) {
            const partner = partners.find(p => p.id === invoice.partnerId);
            if (partner) {
              invoice.partnerName = partner.name;
            }
          }
          return invoice;
        });
      
      setRecentInvoices(recent);

      // Calculate monthly revenue and costs
      let newMonthlyRevenue: Array<number> = Array(6).fill(0);
      let newMonthlyCosts: Array<number> = Array(6).fill(0);
      
      // Fill in realistic revenue and costs based on actual invoice data
      invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const monthIndex = invoiceDate.getMonth();
        
        // Only consider invoices from the last 6 months
        const currentMonth = new Date().getMonth();
        const sixMonthsAgo = (currentMonth - 5 + 12) % 12; // Handle wrap-around correctly
        
        // Map the actual month to our 6-month display window (0-5)
        let displayIndex = -1;
        
        if (monthIndex <= currentMonth && monthIndex >= sixMonthsAgo) {
          // Current year months
          displayIndex = monthIndex - sixMonthsAgo;
        } else if (monthIndex > currentMonth) {
          // Last year months
          displayIndex = (monthIndex - sixMonthsAgo + 12) % 12;
        }
        
        // Only add if it falls within our display window
        if (displayIndex >= 0 && displayIndex < 6) {
          newMonthlyRevenue[displayIndex] += invoice.total;
          // Estimate costs as 65% of revenue for this invoice
          newMonthlyCosts[displayIndex] += Math.round(invoice.total * 0.65);
        }
      });
      
      // If we don't have enough data, fill with sample data
      if (newMonthlyRevenue.every(val => val === 0)) {
        newMonthlyRevenue = Array(6).fill(0).map(() => Math.round(10000 + Math.random() * 20000));
        newMonthlyCosts = newMonthlyRevenue.map(val => Math.round(val * 0.65));
      }
      
      setMonthlyRevenue(newMonthlyRevenue);
      setMonthlyCosts(newMonthlyCosts);

      // Prepare partner purchases data using invoice_items to ensure accurate data
      const partnerData = partners.map((partner: Partner) => {
        // Find all invoices for this partner
        const partnerInvoices = invoices.filter(invoice => invoice.partnerId === partner.id);
        
        // Get all invoice items for this partner's invoices
        const partnerItems: any[] = [];
        partnerInvoices.forEach((invoice: Invoice) => {
          const items = invoiceItems
            .filter((item: InvoiceItem) => item.invoiceId === invoice.id)
            .map((item: InvoiceItem) => ({
              ...item,
              invoice_date: invoice.date,
              invoice_status: invoice.status,
              productName: item.productName || products.find(p => p.id === item.productId)?.name || 'Unbekanntes Produkt'
            }));
          partnerItems.push(...items);
        });
        
        // Calculate total spent
        const totalSpent = partnerInvoices.reduce((sum: number, invoice: Invoice) => sum + invoice.total, 0);
        
        // Count unique products
        const uniqueProducts = new Set(partnerItems.map(item => item.productId)).size;
        
        // Get latest purchase date
        let lastPurchase = '-';
        if (partnerInvoices.length > 0) {
          const sortedInvoices = [...partnerInvoices].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          lastPurchase = sortedInvoices[0].date;
        }
        
        // Get partner's associated products from partner_products relationship
        const partnerProductIds = products
          .filter(product => {
            // Check if this product is in any invoice item for this partner
            return partnerItems.some(item => item.productId === product.id);
          })
          .map(product => ({
            productId: product.id,
            productName: product.name
          }));
        
        return {
          id: partner.id,
          name: partner.name,
          contact: partner.contact,
          email: partner.email,
          phone: partner.phone,
          totalSpent,
          invoiceCount: partnerInvoices.length,
          productCount: uniqueProducts || partnerProductIds.length,
          lastPurchase,
          items: [...partnerItems, ...partnerProductIds]
        };
      });
      
      setPartnerPurchases(partnerData);
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Umsatz',
        data: monthlyRevenue,
        backgroundColor: 'rgba(98, 0, 234, 0.6)',
      },
      {
        label: 'Kosten',
        data: monthlyCosts,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Umsatz & Kosten',
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <Box sx={{ marginBottom: '32px' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#1e293b',
            fontWeight: 600,
            marginBottom: '8px'
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#64748b'
          }}
        >
          Übersicht über Ihre Geschäftskennzahlen
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Quick Action Buttons */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap', 
              mb: 4,
              '& .MuiButton-root': {
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem',
                padding: '8px 16px',
                boxShadow: 'none'
              }
            }}
          >
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              sx={{ 
                backgroundColor: '#6366f1',
                '&:hover': { backgroundColor: '#4f46e5' }
              }}
            >
              Produkt hinzufügen
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AssignmentIcon />}
              onClick={handleCreateInvoice}
              sx={{ 
                backgroundColor: '#10b981',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Rechnung erstellen
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PeopleIcon />}
              onClick={handleManagePartners}
              sx={{ 
                backgroundColor: '#0ea5e9',
                '&:hover': { backgroundColor: '#0284c7' }
              }}
            >
              Partner verwalten
            </Button>
            <Button 
              variant="contained" 
              startIcon={<ShoppingCartIcon />}
              onClick={handleViewInventory}
              sx={{ 
                backgroundColor: '#f59e0b',
                '&:hover': { backgroundColor: '#d97706' }
              }}
            >
              Inventar ansehen
            </Button>
          </Box>
        </Grid>
      
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'white',
              color: '#1e293b',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              },
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onClick={handleViewInventory}
          >
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}
                  >
                    {totalProducts}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    Produkte
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: '#6366f1',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'white',
              color: '#1e293b',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              },
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onClick={handleManagePartners}
          >
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}
                  >
                    {totalPartners}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    Partner
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: '#0ea5e9',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'white',
              color: '#1e293b',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              },
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onClick={() => navigate('/invoices')}
          >
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}
                  >
                    {totalInvoices}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    Rechnungen
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: '#10b981',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: 'white',
              color: '#1e293b',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              },
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}
                  >
                    {formatCurrency(totalRevenue)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    Gesamtumsatz
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    backgroundColor: '#f59e0b',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '24px'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '24px'
              }}
            >
              Umsatzentwicklung
            </Typography>
            <Box sx={{ height: '400px', position: 'relative' }}>
              <Bar 
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
                  datasets: [
                    {
                      label: 'Umsatz',
                      data: monthlyRevenue,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderColor: 'rgba(99, 102, 241, 1)',
                      borderWidth: 2,
                      borderRadius: 4,
                    },
                    {
                      label: 'Kosten',
                      data: monthlyCosts,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 2,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          weight: 500,
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 600,
                      },
                      bodyFont: {
                        size: 13,
                      },
                      displayColors: false,
                      callbacks: {
                        label: function(context: any) {
                          return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 12,
                        },
                        callback: function(value: any) {
                          return formatCurrency(value);
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>
        
        {/* Low Stock Products */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}
          >
            <CardContent sx={{ padding: '24px' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '20px'
                }}
              >
                Produkte mit niedrigem Bestand
              </Typography>
              {lowStockProducts.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <InventoryIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#6366f1',
                      marginBottom: 2,
                      opacity: 0.5
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      color: '#64748b',
                      textAlign: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    Keine Produkte mit niedrigem Bestand
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            color: '#64748b',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            padding: '12px 8px'
                          }}
                        >
                          Produkt
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            color: '#64748b',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            padding: '12px 8px'
                          }}
                        >
                          Bestand
                        </TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow 
                        key={product.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/inventory/edit/${product.id}`)}
                      >
                        <TableCell 
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            color: '#1e293b',
                            fontSize: '0.875rem'
                          }}
                        >
                          {product.name}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            color: product.stock === 0 ? '#ef4444' : product.stock < 3 ? '#f59e0b' : '#1e293b',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}
                        >
                          {product.stock}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '24px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              >
                Neueste Rechnungen
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/invoices')}
                startIcon={<ListAltIcon />}
                sx={{
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)'
                  }
                }}
              >
                Alle Rechnungen
              </Button>
            </Box>
            
            {recentInvoices.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <ReceiptIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: '#6366f1',
                    marginBottom: 2,
                    opacity: 0.5
                  }} 
                />
                <Typography 
                  sx={{ 
                    color: '#64748b',
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}
                >
                  Keine Rechnungen vorhanden
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '12px 8px'
                        }}
                      >
                        Datum
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '12px 8px'
                        }}
                      >
                        Partner
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '12px 8px'
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          padding: '12px 8px'
                        }}
                      >
                        Betrag
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow 
                        key={invoice.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <TableCell 
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            color: '#1e293b',
                            fontSize: '0.875rem'
                          }}
                        >
                          {invoice.date}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            color: '#1e293b',
                            fontSize: '0.875rem'
                          }}
                        >
                          {invoice.partnerName}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            fontSize: '0.875rem'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 2,
                              py: 1,
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: 
                                invoice.status === 'Bezahlt' ? 'rgba(16, 185, 129, 0.1)' : 
                                invoice.status === 'Ausstehend' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                              color: 
                                invoice.status === 'Bezahlt' ? '#10b981' : 
                                invoice.status === 'Ausstehend' ? '#f59e0b' : '#6366f1'
                            }}
                          >
                            {invoice.status}
                          </Box>
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                            padding: '12px 8px',
                            color: '#1e293b',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {formatCurrency(invoice.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Partner Purchases Table */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '24px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginRight: '16px'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#1e293b'
                  }}
                >
                  Partner und ihre Produkte
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/partners')}
                startIcon={<PeopleIcon />}
                sx={{
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)'
                  }
                }}
              >
                Alle Partner
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Partner
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Kontakt
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Telefon
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Anz. Produkte
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Anz. Rechnungen
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Gesamtausgaben
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '12px 8px'
                      }}
                    >
                      Verknüpfte Produkte
                    </TableCell>
                  </TableRow>
                </TableHead>
                  <TableBody>
                    {partnerPurchases
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .map((partner) => (
                        <TableRow 
                          key={partner.id} 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                            },
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/partners/${partner.id}`)}
                        >
                          <TableCell 
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem'
                            }}
                          >
                            {partner.name}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem'
                            }}
                          >
                            {partner.contact || '-'}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem'
                            }}
                          >
                            {partner.phone || '-'}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          >
                            {partner.productCount}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          >
                            {partner.invoiceCount}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px',
                              color: '#1e293b',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          >
                            {formatCurrency(partner.totalSpent)}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                              padding: '12px 8px'
                            }}
                          >
                            {partner.productCount > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {partner.items
                                  .reduce((acc: any[], item: any) => {
                                    if (!acc.some(p => p.productId === item.productId)) {
                                      acc.push(item);
                                    }
                                    return acc;
                                  }, [])
                                  .slice(0, 3)
                                  .map((item: any, index: number) => (
                                    <Box
                                      key={`${partner.id}-${item.productId}-${index}`}
                                      sx={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 1,
                                        borderRadius: '9999px',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        color: '#6366f1',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        maxWidth: '120px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {item.productName}
                                    </Box>
                                  ))}
                                {partner.productCount > 3 && (
                                  <Box
                                    sx={{ 
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      px: 2,
                                      py: 1,
                                      borderRadius: '9999px',
                                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                      color: '#6366f1',
                                      fontSize: '0.75rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    +{partner.productCount - 3} mehr
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
