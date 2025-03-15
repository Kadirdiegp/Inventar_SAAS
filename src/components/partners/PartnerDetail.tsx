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
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon
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
        <Box sx={{ py: 2 }}>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Mobil-optimierte Komponente für Rechnungen
  const MobileInvoicesList = () => (
    <List sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.03)', p: 0, borderRadius: '12px' }}>
      {partnerInvoices.length > 0 ? (
        partnerInvoices.map((invoice) => (
          <Card key={invoice.id} sx={{ 
            mb: 2, 
            boxShadow: 2, 
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>{invoice.date}</Typography>
                </Box>
                <Chip 
                  label={invoice.status} 
                  size="small"
                  sx={{
                    bgcolor: invoice.status === 'Bezahlt' 
                      ? 'rgba(0, 200, 83, 0.2)' 
                      : invoice.status === 'Entwurf' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(247, 159, 31, 0.2)',
                    color: 'white',
                    border: 'none'
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Netto</Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>{formatCurrency(invoice.subtotal)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>MwSt</Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>{formatCurrency(invoice.tax)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Gesamt</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>{formatCurrency(invoice.total)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 2 }}>
          Keine Rechnungen für diesen Partner vorhanden.
        </Typography>
      )}
    </List>
  );

  // Mobil-optimierte Komponente für Produkte
  const MobileProductsList = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<InventoryIcon />}
          onClick={() => onAddProductToPartner(partner.id)}
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
          sx={{
            bgcolor: 'white',
            color: 'black',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
          }}
        >
          Produkte verwalten
        </Button>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.03)', p: 0, borderRadius: '12px' }}>
        {partnerProducts.length > 0 ? (
          partnerProducts.map((product) => (
            <Card key={product.id} sx={{ 
              mb: 2, 
              boxShadow: 2, 
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" component="div" fontWeight="bold" sx={{ color: 'white' }}>
                  {product.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                  <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {product.category || 'Keine Kategorie'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Verkaufspreis</Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>{formatCurrency(product.sellingPrice)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Bestand</Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>{product.stock} Stück</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 2 }}>
            Keine Produkte für diesen Partner vorhanden.
          </Typography>
        )}
      </List>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '12px',
          bgcolor: 'black',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          p: isMobile ? 2 : 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'black',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} component="div" fontWeight="bold" sx={{ color: 'white' }}>
          Partner Details
        </Typography>
        {isMobile && (
          <IconButton edge="end" sx={{ color: 'white' }} onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 2 : 3, bgcolor: 'black' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Card sx={{ 
                boxShadow: 'none', 
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: 'white' }}>
                    {partner.name}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <List disablePadding>
                        {partner.email && (
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <EmailIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {partner.email}
                                </Typography>
                              } 
                            />
                          </ListItem>
                        )}
                        
                        {partner.contact && (
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <PhoneIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {partner.contact}
                                </Typography>
                              } 
                            />
                          </ListItem>
                        )}
                        
                        {partner.address && (
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <LocationIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {partner.address}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                        
                        {partner.notes && (
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 36, alignSelf: 'flex-start', mt: 0.5 }}>
                              <NotesIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {partner.notes}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        height: '100%',
                        boxShadow: 'none',
                        borderRadius: '8px'
                      }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Gesamtumsatz
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                            {formatCurrency(totalSpent)}
                          </Typography>
                          
                          <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Anzahl Rechnungen
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                            {partnerInvoices.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
            
            {isMobile ? (
              // Mobile Tabs
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    sx={{
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'white',
                      },
                      '& .MuiTab-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&.Mui-selected': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <Tab icon={<ReceiptIcon />} label="Rechnungen" />
                    <Tab icon={<InventoryIcon />} label="Produkte" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <MobileInvoicesList />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <MobileProductsList />
                </TabPanel>
              </>
            ) : (
              // Desktop View
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ color: 'white' }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        Rechnungen
                      </Box>
                    </Typography>
                  </Box>
                  
                  {partnerInvoices.length > 0 ? (
                    <TableContainer component={Paper} sx={{ 
                      maxHeight: 400, 
                      overflowY: 'auto',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'none'
                    }}>
                      <Table stickyHeader aria-label="partner invoices table" size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Datum</TableCell>
                            <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Status</TableCell>
                            <TableCell align="right" sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Netto</TableCell>
                            <TableCell align="right" sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>MwSt</TableCell>
                            <TableCell align="right" sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Gesamt</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {partnerInvoices.map((invoice) => (
                            <TableRow key={invoice.id} hover>
                              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{invoice.date}</TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Chip 
                                  label={invoice.status} 
                                  size="small" 
                                  sx={{
                                    bgcolor: invoice.status === 'Bezahlt' 
                                      ? 'rgba(0, 200, 83, 0.2)' 
                                      : invoice.status === 'Entwurf' 
                                      ? 'rgba(255, 255, 255, 0.1)' 
                                      : 'rgba(247, 159, 31, 0.2)',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{formatCurrency(invoice.subtotal)}</TableCell>
                              <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{formatCurrency(invoice.tax)}</TableCell>
                              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{formatCurrency(invoice.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 2 }}>
                      Keine Rechnungen für diesen Partner vorhanden.
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} lg={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ color: 'white' }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <InventoryIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                        Produkte
                      </Box>
                    </Typography>
                    
                    <Button 
                      variant="contained"
                      startIcon={<InventoryIcon />}
                      onClick={() => onAddProductToPartner(partner.id)}
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        color: 'black',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                        borderRadius: '50px',
                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      Produkte verwalten
                    </Button>
                  </Box>
                  
                  {partnerProducts.length > 0 ? (
                    <TableContainer component={Paper} sx={{ 
                      maxHeight: 400, 
                      overflowY: 'auto',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'none'
                    }}>
                      <Table stickyHeader aria-label="partner products table" size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Produktname</TableCell>
                            <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Kategorie</TableCell>
                            <TableCell align="right" sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Verkaufspreis</TableCell>
                            <TableCell align="right" sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>Bestand</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {partnerProducts.map((product) => (
                            <TableRow key={product.id} hover>
                              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.name}</TableCell>
                              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.category || 'Keine Kategorie'}</TableCell>
                              <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{formatCurrency(product.sellingPrice)}</TableCell>
                              <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.stock} Stück</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 2 }}>
                      Keine Produkte für diesen Partner vorhanden.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: isMobile ? 2 : 3, 
        pt: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            px: 3,
            py: 1,
            borderRadius: '50px',
            borderColor: 'white',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerDetail;
