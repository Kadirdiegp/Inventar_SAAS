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
    <Box sx={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      <PageHeader 
        title="Dashboard" 
        subtitle="Übersicht über Ihre Geschäftskennzahlen" 
      />
      
      <Grid container spacing={3}>
        {/* Quick Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              sx={{ 
                backgroundColor: '#6200ea',
                '&:hover': { backgroundColor: '#5000c9' }
              }}
            >
              Produkt hinzufügen
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AssignmentIcon />}
              onClick={handleCreateInvoice}
              sx={{ 
                backgroundColor: '#388e3c',
                '&:hover': { backgroundColor: '#2e7d32' }
              }}
            >
              Rechnung erstellen
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PeopleIcon />}
              onClick={handleManagePartners}
              sx={{ 
                backgroundColor: '#0288d1',
                '&:hover': { backgroundColor: '#0277bd' }
              }}
            >
              Partner verwalten
            </Button>
            <Button 
              variant="contained" 
              startIcon={<ShoppingCartIcon />}
              onClick={handleViewInventory}
              sx={{ 
                backgroundColor: '#f57c00',
                '&:hover': { backgroundColor: '#ef6c00' }
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
              background: 'linear-gradient(135deg, #6200ea 0%, #b388ff 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
            onClick={handleViewInventory}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#E0E0E0' }}>
                    {totalProducts}
                  </Typography>
                  <Typography variant="body2">Produkte</Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
            onClick={handleManagePartners}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#E0E0E0' }}>
                    {totalPartners}
                  </Typography>
                  <Typography variant="body2">Partner</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/invoices')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#E0E0E0' }}>
                    {totalInvoices}
                  </Typography>
                  <Typography variant="body2">Rechnungen</Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalRevenue)}
                  </Typography>
                  <Typography variant="body2">Gesamtumsatz</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Umsatzentwicklung</Typography>
            <Bar options={chartOptions} data={chartData} />
          </Paper>
        </Grid>
        
        {/* Low Stock Products */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                boxShadow: 3,
                cursor: 'pointer'
              }
            }}
            onClick={handleViewInventory}
          >
            <Typography variant="h6" gutterBottom>Produkte mit niedrigem Bestand</Typography>
            {lowStockProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Keine Produkte mit niedrigem Bestand
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produkt</TableCell>
                      <TableCell align="right">Bestand</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: product.stock === 0 ? 'error.main' : product.stock < 3 ? 'warning.main' : 'text.primary'
                        }}>
                          {product.stock}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              transition: 'transform 0.2s',
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Neueste Rechnungen</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/invoices')}
                startIcon={<ListAltIcon />}
              >
                Alle Rechnungen
              </Button>
            </Box>
            
            {recentInvoices.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Keine Rechnungen vorhanden
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Datum</TableCell>
                      <TableCell>Partner</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Betrag</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow 
                        key={invoice.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.partnerName}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: 
                                invoice.status === 'Bezahlt' ? 'success.light' : 
                                invoice.status === 'Ausstehend' ? 'warning.light' : 'info.light',
                              color: 
                                invoice.status === 'Bezahlt' ? 'success.dark' : 
                                invoice.status === 'Ausstehend' ? 'warning.dark' : 'info.dark',
                            }}
                          >
                            {invoice.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Partner Purchases Table */}
        <Grid item xs={12}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 3,
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    Partner und ihre Produkte
                  </Box>
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/partners')}
                  startIcon={<PeopleIcon />}
                >
                  Alle Partner
                </Button>
              </Box>
              
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Partner</TableCell>
                      <TableCell>Kontakt</TableCell>
                      <TableCell align="center">Telefon</TableCell>
                      <TableCell align="center">Anz. Produkte</TableCell>
                      <TableCell align="center">Anz. Rechnungen</TableCell>
                      <TableCell align="right">Gesamtausgaben</TableCell>
                      <TableCell align="center">Verknüpfte Produkte</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partnerPurchases
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .map((partner) => (
                        <TableRow 
                          key={partner.id} 
                          hover
                          onClick={() => navigate(`/partners/${partner.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{partner.name}</TableCell>
                          <TableCell>{partner.contact || '-'}</TableCell>
                          <TableCell align="center">{partner.phone || '-'}</TableCell>
                          <TableCell align="center">{partner.productCount}</TableCell>
                          <TableCell align="center">{partner.invoiceCount}</TableCell>
                          <TableCell align="right">{formatCurrency(partner.totalSpent)}</TableCell>
                          <TableCell align="center">
                            {partner.productCount > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                {partner.items
                                  .reduce((acc: any[], item: any) => {
                                    // Nur eindeutige Produkte in die Liste aufnehmen
                                    if (!acc.some(p => p.productId === item.productId)) {
                                      acc.push(item);
                                    }
                                    return acc;
                                  }, [])
                                  .slice(0, 3) // Maximal 3 Produkte anzeigen
                                  .map((item: any, index: number) => (
                                    <Typography 
                                      key={`${partner.id}-${item.productId}-${index}`} 
                                      variant="body2" 
                                      sx={{ 
                                        px: 1, 
                                        py: 0.5, 
                                        borderRadius: 1, 
                                        backgroundColor: '#f0f0ff',
                                        fontSize: '0.75rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100px'
                                      }}
                                    >
                                      {item.productName}
                                    </Typography>
                                  ))}
                                {partner.productCount > 3 && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      px: 1, 
                                      py: 0.5, 
                                      borderRadius: 1, 
                                      backgroundColor: '#e0e0e0',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    +{partner.productCount - 3} mehr
                                  </Typography>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Partner Purchases */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Partner-Einkäufe</Typography>
            {partnerPurchases.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Keine Partner vorhanden
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Partner</TableCell>
                      <TableCell>Kontakt</TableCell>
                      <TableCell>Anzahl Rechnungen</TableCell>
                      <TableCell>Anzahl Produkte</TableCell>
                      <TableCell>Letzter Einkauf</TableCell>
                      <TableCell align="right">Gesamtausgaben</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partnerPurchases.map((partner) => (
                      <TableRow 
                        key={partner.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => navigate(`/partners/${partner.id}`)}
                      >
                        <TableCell>{partner.name}</TableCell>
                        <TableCell>{partner.contact || '-'}</TableCell>
                        <TableCell>{partner.invoiceCount}</TableCell>
                        <TableCell>{partner.productCount}</TableCell>
                        <TableCell>{partner.lastPurchase}</TableCell>
                        <TableCell align="right">{formatCurrency(partner.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
