import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { Partner, Invoice, Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { fetchInvoicesByPartner } from '../../services/invoiceService';
import { fetchProductsByPartner } from '../../services/productService';

interface PartnerDetailProps {
  open: boolean;
  onClose: () => void;
  partner: Partner;
  onAddProductToPartner: (partnerId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`partner-tabpanel-${index}`}
      aria-labelledby={`partner-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PartnerDetail: React.FC<PartnerDetailProps> = ({ 
  open, 
  onClose, 
  partner, 
  onAddProductToPartner 
}) => {
  const [partnerInvoices, setPartnerInvoices] = useState<Invoice[]>([]);
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadPartnerInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const invoices = await fetchInvoicesByPartner(partner.id);
      setPartnerInvoices(invoices);
      
      // Berechne die Gesamtausgaben des Partners
      const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      setTotalSpent(total);
      
      // Produkte laden
      const products = await fetchProductsByPartner(partner.id);
      setPartnerProducts(products);
    } catch (error) {
      console.error('Fehler beim Laden der Partner-Daten:', error);
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  useEffect(() => {
    if (open && partner) {
      loadPartnerInvoices();
    }
  }, [open, partner, loadPartnerInvoices]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {partner.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              {/* Kontaktinformationen */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Kontaktinformationen
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        <EmailIcon fontSize="small" />
                      </Box>
                      <Typography>{partner.email || 'Keine E-Mail angegeben'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        <PhoneIcon fontSize="small" />
                      </Box>
                      <Typography>{partner.phone || 'Keine Telefonnummer angegeben'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        <LocationIcon fontSize="small" />
                      </Box>
                      <Typography>{partner.address || 'Keine Adresse angegeben'}</Typography>
                    </Box>
                    
                    {partner.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ mr: 1, color: 'primary.main', mt: 0.5 }}>
                          <NotesIcon fontSize="small" />
                        </Box>
                        <Typography>{partner.notes}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Zusammenfassung */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Übersicht
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Ansprechpartner:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {partner.contact || 'Nicht angegeben'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Anzahl Rechnungen:</Typography>
                      <Chip 
                        label={partnerInvoices.length} 
                        color="primary" 
                        size="small" 
                        icon={<ReceiptIcon fontSize="small" />} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Anzahl verschiedener Produkte:</Typography>
                      <Chip 
                        label={partnerProducts.length} 
                        color="secondary" 
                        size="small" 
                        icon={<InventoryIcon fontSize="small" />} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Gesamtausgaben:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {formatCurrency(totalSpent)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ width: '100%', mb: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="Partner Informationen Tabs">
                  <Tab label="Rechnungshistorie" icon={<ReceiptIcon />} iconPosition="start" />
                  <Tab label="Produkte des Partners" icon={<InventoryIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                {/* Rechnungshistorie */}
                {partnerInvoices.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table aria-label="Rechnungstabelle" size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Datum</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Netto</TableCell>
                          <TableCell align="right">MwSt</TableCell>
                          <TableCell align="right">Gesamt</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {partnerInvoices.map((invoice) => (
                          <TableRow key={invoice.id} hover>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>
                              <Chip 
                                label={invoice.status} 
                                size="small"
                                color={
                                  invoice.status === 'Bezahlt' ? 'success' : 
                                  invoice.status === 'Entwurf' ? 'default' : 'warning'
                                }
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(invoice.subtotal)}</TableCell>
                            <TableCell align="right">{formatCurrency(invoice.tax)}</TableCell>
                            <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                    Keine Rechnungen für diesen Partner vorhanden.
                  </Typography>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                {/* Produkte des Partners */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<InventoryIcon />}
                    onClick={() => onAddProductToPartner(partner.id)}
                  >
                    Produkte für Partner verwalten
                  </Button>
                </Box>
                
                {partnerProducts.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table aria-label="Produkttabelle" size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produkt</TableCell>
                          <TableCell>Kategorie</TableCell>
                          <TableCell align="right">Einkaufspreis</TableCell>
                          <TableCell align="right">Verkaufspreis</TableCell>
                          <TableCell align="right">Menge</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {partnerProducts.map((product) => (
                          <TableRow key={product.id} hover>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={product.category} 
                                size="small"
                                sx={{ backgroundColor: '#e0e0ff', color: '#3700b3' }}
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(product.purchasePrice)}</TableCell>
                            <TableCell align="right">{formatCurrency(product.sellingPrice)}</TableCell>
                            <TableCell align="right">{product.stock}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                    Keine Produkte für diesen Partner vorhanden. Fügen Sie Produkte hinzu, um sie hier zu sehen.
                  </Typography>
                )}
              </TabPanel>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerDetail;
