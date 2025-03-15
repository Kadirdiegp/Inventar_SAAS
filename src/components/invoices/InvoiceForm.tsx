import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Invoice, InvoiceItem, Product, Partner } from '../../types';
import { formatCurrency, calculateInvoiceTotals } from '../../utils/helpers';
import { fetchProductsByPartner, addProductToPartner, fetchProducts } from '../../services/productService';

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id'> | Invoice) => void;
  invoice?: Invoice;
  partners: Partner[];
  title: string;
}

const initialInvoice: Omit<Invoice, 'id'> = {
  partnerId: '',
  partnerName: '',
  date: new Date().toISOString().split('T')[0],
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  status: 'Entwurf',
  notes: ''
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  open, 
  onClose, 
  onSave, 
  invoice, 
  partners,
  title 
}) => {
  const [formData, setFormData] = useState<Omit<Invoice, 'id'> | Invoice>(initialInvoice);
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productTab, setProductTab] = useState<'partner' | 'all'>('partner');
  const [addingProduct, setAddingProduct] = useState<boolean>(false);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
      // Wenn eine bestehende Rechnung bearbeitet wird, lade die Partner-Produkte
      if (invoice.partnerId) {
        loadPartnerProducts(invoice.partnerId);
        loadAllProducts();
      }
    } else {
      setFormData(initialInvoice);
      setPartnerProducts([]);
    }
  }, [invoice, open]);

  // Zurücksetzen der ausgewählten Produkte und Mengen wenn sich der Tab oder Partner ändert
  useEffect(() => {
    setSelectedProducts([]);
    setProductQuantities({});
  }, [productTab, formData.partnerId]);

  const loadPartnerProducts = async (partnerId: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const products = await fetchProductsByPartner(partnerId);
      setPartnerProducts(products);
    } catch (error) {
      console.error('Fehler beim Laden der Partner-Produkte:', error);
      setErrorMessage('Produkte konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const products = await fetchProducts();
      setAllProducts(products);
    } catch (error) {
      console.error('Fehler beim Laden aller Produkte:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'partnerId') {
      const selectedPartner = partners.find(p => p.id === value);
      setFormData({
        ...formData,
        partnerId: value,
        partnerName: selectedPartner ? selectedPartner.name : ''
      });
      
      // Lade Partner-spezifische Produkte, wenn ein Partner ausgewählt wurde
      if (value) {
        loadPartnerProducts(value);
        loadAllProducts();
        setProductTab('partner'); // Zurück zum Partner-Tab bei Partnerwechsel
      } else {
        setPartnerProducts([]);
        setAllProducts([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'partner' | 'all') => {
    setProductTab(newValue);
    setSelectedProducts([]);
    setProductQuantities({});
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: value < 1 ? 1 : value
    }));
  };

  // Toggle, um alle Produkte auf einmal auszuwählen oder abzuwählen
  const toggleSelectAllProducts = () => {
    const currentProductList = productTab === 'partner' ? partnerProducts : allProducts;
    
    if (selectedProducts.length === currentProductList.length) {
      // Wenn alle ausgewählt sind, setze alle zurück
      setSelectedProducts([]);
      setProductQuantities({});
    } else {
      // Sonst wähle alle aus
      const allProductIds = currentProductList.map(product => product.id);
      setSelectedProducts(allProductIds);
      
      // Setze für alle Produkte die Standardmenge 1
      const initialQuantities: Record<string, number> = {};
      allProductIds.forEach(id => {
        initialQuantities[id] = productQuantities[id] || 1;
      });
      setProductQuantities(initialQuantities);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // Wenn ein neues Produkt ausgewählt wird, setze die Menge standardmäßig auf 1
        if (!productQuantities[productId]) {
          setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: 1
          }));
        }
        return [...prev, productId];
      }
    });
  };

  const addProductsToInvoice = async () => {
    if (selectedProducts.length === 0 || !formData.partnerId) return;
    
    const productsToAdd: Product[] = [];
    const currentProductList = productTab === 'partner' ? partnerProducts : allProducts;
    
    // Nicht-Partner-Produkte dem Partner zuordnen (falls ausgewählt aus "Alle Produkte")
    if (productTab === 'all') {
      const nonPartnerProducts = selectedProducts.filter(
        productId => !partnerProducts.some(p => p.id === productId)
      );
      
      if (nonPartnerProducts.length > 0) {
        setAddingProduct(true);
        try {
          // Füge alle neuen Produkte zum Partner hinzu
          for (const productId of nonPartnerProducts) {
            await addProductToPartner(formData.partnerId, productId);
          }
          
          // Partner-Produkte neu laden
          await loadPartnerProducts(formData.partnerId);
        } catch (error) {
          console.error('Fehler beim Hinzufügen der Produkte zum Partner:', error);
        } finally {
          setAddingProduct(false);
        }
      }
    }
    
    // Sammle alle ausgewählten Produkte
    for (const productId of selectedProducts) {
      const product = currentProductList.find(p => p.id === productId);
      if (product) {
        productsToAdd.push(product);
      }
    }
    
    // Füge alle Produkte zur Rechnung hinzu
    let updatedItems = [...formData.items];
    
    for (const product of productsToAdd) {
      const quantity = productQuantities[product.id] || 1;
      
      // Prüfe, ob das Produkt bereits in der Rechnung ist
      const existingItemIndex = updatedItems.findIndex(item => item.productId === product.id);
      
      // Verwende den Kundenpreis falls vorhanden, sonst den Standard-Verkaufspreis
      const priceToUse = productTab === 'partner' && product.partnerPrice !== null && product.partnerPrice !== undefined 
        ? product.partnerPrice 
        : product.sellingPrice;
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          total: newQuantity * existingItem.unitPrice
        };
      } else {
        // Add new item
        const newItem: InvoiceItem = {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: priceToUse,
          total: quantity * priceToUse
        };
        
        updatedItems.push(newItem);
      }
    }
    
    const { subtotal, tax, total } = calculateInvoiceTotals(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
    
    // Reset selection
    setSelectedProducts([]);
    setProductQuantities({});
  };

  const removeItem = (index: number) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    const { subtotal, tax, total } = calculateInvoiceTotals(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.partnerId) {
      newErrors.partnerId = 'Partner ist erforderlich';
    }
    
    if (!formData.date) {
      newErrors.date = 'Datum ist erforderlich';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Mindestens ein Produkt ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  // Die Produkte, die in der aktuellen Ansicht angezeigt werden sollen
  const displayProducts = productTab === 'partner' ? partnerProducts : allProducts;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal" error={!!errors.partnerId}>
              <InputLabel>Partner</InputLabel>
              <Select
                name="partnerId"
                value={formData.partnerId}
                onChange={handleSelectChange}
                label="Partner"
              >
                {partners.map((partner) => (
                  <MenuItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.partnerId && (
                <Typography variant="caption" color="error">
                  {errors.partnerId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Datum"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.date}
              helperText={errors.date}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="Entwurf">Entwurf</MenuItem>
                <MenuItem value="sent">Gesendet</MenuItem>
                <MenuItem value="paid">Bezahlt</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Produkte hinzufügen
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : errorMessage ? (
              <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>
            ) : formData.partnerId ? (
              <>
                <Tabs 
                  value={productTab} 
                  onChange={handleTabChange} 
                  sx={{ mb: 2 }}
                  textColor="primary"
                  indicatorColor="primary"
                >
                  <Tab value="partner" label="Partner-Produkte" />
                  <Tab value="all" label="Alle Produkte" />
                </Tabs>
                
                {productTab === 'partner' && partnerProducts.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Dieser Partner hat noch keine Produkte. Wechseln Sie zu "Alle Produkte" um Produkte hinzuzufügen.
                  </Alert>
                ) : (
                  <>
                    <Paper variant="outlined" sx={{ mb: 3, maxHeight: '300px', overflow: 'auto' }}>
                      <List dense>
                        <ListItem 
                          sx={{ 
                            bgcolor: '#f5f5f5', 
                            position: 'sticky', 
                            top: 0, 
                            zIndex: 1,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedProducts.length > 0 && selectedProducts.length === displayProducts.length}
                              indeterminate={selectedProducts.length > 0 && selectedProducts.length < displayProducts.length}
                              onChange={toggleSelectAllProducts}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography component="div" variant="subtitle2">
                                Alle auswählen ({displayProducts.length} Produkte)
                              </Typography>
                            }
                          />
                        </ListItem>
                        {displayProducts.map((product) => {
                          // Prüfe, ob dieses Produkt bereits dem Partner zugeordnet ist
                          const isPartnerProduct = productTab === 'all' && partnerProducts.some(p => p.id === product.id);
                          
                          // Berechne den anzuzeigenden Preis
                          const price = productTab === 'partner' && product.partnerPrice !== null && product.partnerPrice !== undefined
                            ? product.partnerPrice
                            : product.sellingPrice;
                          
                          return (
                            <ListItem key={product.id} divider>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => handleProductToggle(product.id)}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box component="div">
                                    <Typography component="div" variant="body1">{product.name}</Typography>
                                    {productTab === 'partner' && product.partnerPrice !== null && 
                                    product.partnerPrice !== undefined && 
                                    product.partnerPrice !== product.sellingPrice && (
                                      <Typography 
                                        component="span"
                                        variant="caption" 
                                        sx={{ ml: 1, bgcolor: 'rgba(0, 200, 83, 0.1)', 
                                        p: '2px 6px', borderRadius: '4px' }}
                                      >
                                        Kundenpreis
                                      </Typography>
                                    )}
                                    {isPartnerProduct && (
                                      <Typography 
                                        component="span"
                                        variant="caption" 
                                        sx={{ ml: 1, bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                        p: '2px 6px', borderRadius: '4px' }}
                                      >
                                        Partner-Produkt
                                      </Typography>
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box component="div">
                                    <Typography component="div" variant="body2">
                                      <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={6}>
                                          <Box component="div">
                                            Preis: {formatCurrency(price)}
                                          </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                          {selectedProducts.includes(product.id) && (
                                            <TextField
                                              label="Menge"
                                              type="number"
                                              value={productQuantities[product.id] || 1}
                                              onChange={(e) => handleQuantityChange(
                                                product.id, 
                                                parseInt(e.target.value) || 1
                                              )}
                                              InputProps={{ inputProps: { min: 1 } }}
                                              size="small"
                                              sx={{ width: '100px' }}
                                            />
                                          )}
                                        </Grid>
                                      </Grid>
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography component="div" variant="body2">
                        {selectedProducts.length} Produkte ausgewählt
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={addProductsToInvoice}
                        disabled={selectedProducts.length === 0 || addingProduct}
                        sx={{ 
                          backgroundColor: '#6200ea',
                          '&:hover': {
                            backgroundColor: '#3700b3',
                          }
                        }}
                      >
                        {addingProduct ? (
                          <>Füge Produkte hinzu... <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} /></>
                        ) : productTab === 'all' && selectedProducts.some(id => !partnerProducts.some(p => p.id === id)) ? (
                          'Zu Partner hinzufügen & zur Rechnung'
                        ) : (
                          'Ausgewählte Produkte zur Rechnung hinzufügen'
                        )}
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Bitte wählen Sie zuerst einen Partner aus, um dessen Produkte zu sehen.
              </Alert>
            )}
            
            {errors.items && (
              <Typography component="div" variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.items}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell align="right">Preis</TableCell>
                    <TableCell align="right">Menge</TableCell>
                    <TableCell align="right">Gesamt</TableCell>
                    <TableCell align="center">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Keine Produkte hinzugefügt
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => removeItem(index)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mb: 1 }}>
                <Typography component="div" variant="body1">Zwischensumme:</Typography>
                <Typography component="div" variant="body1">{formatCurrency(formData.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography component="div" variant="h6">Gesamtsumme:</Typography>
                <Typography component="div" variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(formData.total)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notizen"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          sx={{ 
            backgroundColor: '#6200ea',
            '&:hover': {
              backgroundColor: '#3700b3',
            }
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceForm;
