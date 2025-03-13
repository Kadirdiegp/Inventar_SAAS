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
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Invoice, InvoiceItem, Product, Partner } from '../../types';
import { formatCurrency, calculateInvoiceTotals } from '../../utils/helpers';
import { getProducts } from '../../utils/storage';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    } else {
      setFormData(initialInvoice);
    }
    
    // Load products
    setProducts(getProducts());
  }, [invoice, open]);

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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleProductChange = (e: any) => {
    setSelectedProduct(e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
  };

  const addProductToInvoice = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);
    
    let updatedItems: InvoiceItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...formData.items];
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
        unitPrice: product.sellingPrice,
        total: quantity * product.sellingPrice
      };
      
      updatedItems = [...formData.items, newItem];
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
    setSelectedProduct('');
    setQuantity(1);
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
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel>Produkt</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={handleProductChange}
                    label="Produkt"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.sellingPrice)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Menge"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={addProductToInvoice}
                  disabled={!selectedProduct}
                  fullWidth
                  sx={{ 
                    height: '56px',
                    backgroundColor: '#6200ea',
                    '&:hover': {
                      backgroundColor: '#3700b3',
                    }
                  }}
                >
                  Hinzufügen
                </Button>
              </Grid>
            </Grid>
            
            {errors.items && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
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
                <Typography variant="body1">Zwischensumme:</Typography>
                <Typography variant="body1">{formatCurrency(formData.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', mb: 1 }}>
                <Typography variant="body1">MwSt (19%):</Typography>
                <Typography variant="body1">{formatCurrency(formData.tax)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '300px', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">Gesamtsumme:</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
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
