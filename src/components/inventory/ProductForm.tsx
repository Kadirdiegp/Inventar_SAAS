import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  SelectChangeEvent,
  InputAdornment
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Product } from '../../types';
import { ProductCategory, fetchCategories } from '../../services/categoryService';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  product?: Product;
  title: string;
}

const initialProduct: Omit<Product, 'id'> = {
  name: '',
  description: '',
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
  imageUrl: '',
  category_id: '',
  category: ''
};

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, onSave, product, title }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'> | Product>(initialProduct);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Loading categories...');
        const categoriesData = await fetchCategories();
        console.log('Categories loaded:', categoriesData);
        setCategories(categoriesData);
        
        // Überprüfe, ob die aktuelle Kategorie des Produkts in den geladenen Kategorien vorhanden ist
        if (product && product.category_id) {
          const categoryExists = categoriesData.some(cat => cat.id === product.category_id);
          console.log(`Category ${product.category_id} exists in loaded categories: ${categoryExists}`);
          
          if (!categoryExists && categoriesData.length > 0) {
            // Wenn die Kategorie nicht existiert, setze die erste verfügbare Kategorie
            console.log(`Setting default category to ${categoriesData[0].id}`);
            setFormData(prev => ({
              ...prev,
              category_id: categoriesData[0].id,
              category: categoriesData[0].name
            }));
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      loadCategories();
    }
  }, [product, open, setFormData]);

  useEffect(() => {
    if (product) {
      setFormData(product);
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    } else {
      setFormData(initialProduct);
      setImagePreview('');
    }
    setErrors({});
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    console.log(`Changing field ${name} to value:`, value);

    if (name === 'purchasePrice' || name === 'sellingPrice' || name === 'stock') {
      // Konvertiere Strings zu Zahlen für numerische Felder
      const numValue = parseFloat(value as string);
      setFormData({ ...formData, [name]: numValue });
    } else if (name === 'category_id') {
      const selectedCategory = categories.find(cat => cat.id === value);
      console.log('Selected category:', selectedCategory);
      
      setFormData({ 
        ...formData, 
        category_id: value as string,
        category: selectedCategory ? selectedCategory.name : '' 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Lösche Fehler für dieses Feld, wenn es korrigiert wurde
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleValidate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Produktname ist erforderlich';
    }

    if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Einkaufspreis muss größer oder gleich 0 sein';
    }

    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Verkaufspreis muss größer oder gleich 0 sein';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Bestand muss größer oder gleich 0 sein';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Bitte wählen Sie eine Kategorie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (handleValidate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, imageUrl: value });
    setImagePreview(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category_id}>
                <InputLabel id="category-label">Kategorie</InputLabel>
                <Select
                  labelId="category-label"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleChange}
                  label="Kategorie"
                  disabled={loadingCategories}
                >
                  {loadingCategories ? (
                    <MenuItem value="" disabled>
                      <CircularProgress size={20} /> Kategorien werden geladen...
                    </MenuItem>
                  ) : categories && categories.length > 0 ? (
                    [
                      <MenuItem key="placeholder" value="" disabled>Bitte Kategorie auswählen</MenuItem>,
                      ...categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <span>{category.name}</span>
                            <Chip 
                              label={category.type} 
                              size="small" 
                              sx={{ 
                                backgroundColor: category.type === 'IMPORT' ? '#e3f2fd' : 
                                                category.type === 'EXPORT' ? '#e8f5e9' : '#fff3e0',
                                color: category.type === 'IMPORT' ? '#1565c0' : 
                                       category.type === 'EXPORT' ? '#2e7d32' : '#ef6c00'
                              }} 
                            />
                          </Box>
                        </MenuItem>
                      ))
                    ]
                  ) : (
                    <MenuItem value="" disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorOutlineIcon color="error" fontSize="small" />
                        <span>Keine Kategorien verfügbar. Bitte überprüfen Sie die Datenbankverbindung.</span>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
                {errors.category_id && (
                  <Typography variant="caption" color="error">
                    {errors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="dense"
                label="Beschreibung"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Einkaufspreis"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Verkaufspreis"
                name="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Bestand"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                error={!!errors.stock}
                helperText={errors.stock}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="dense"
                label="Bild-URL"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleImageChange}
              />
            </Grid>
            {imagePreview && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Bildvorschau:</Typography>
                <Box
                  component="img"
                  sx={{
                    height: 200,
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: 1
                  }}
                  alt="Produktbild"
                  src={imagePreview}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Bild+nicht+verfügbar';
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Speichern</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
