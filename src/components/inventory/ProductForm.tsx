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
  CircularProgress,
  SelectChangeEvent,
  InputAdornment,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  sellingPrice: 0,
  purchasePrice: 0,
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    if (name === 'sellingPrice' || name === 'purchasePrice' || name === 'stock') {
      // Numerische Felder behandeln
      if (value === '') {
        // Bei leeren Eingaben den Wert auf 0 setzen (oder optional auf null)
        setFormData({ ...formData, [name]: 0 });
      } else {
        // Konvertiere Strings zu Zahlen, aber nur wenn eine gültige Zahl vorhanden ist
        const numValue = value === '' ? 0 : parseFloat(value as string);
        // Prüfen, ob der Wert gültig ist (keine NaN)
        if (!isNaN(numValue)) {
          setFormData({ ...formData, [name]: numValue });
        } else {
          // Bei ungültigen Eingaben den Wert nicht aktualisieren und optional einen Fehler setzen
          setErrors({
            ...errors,
            [name]: 'Bitte geben Sie eine gültige Zahl ein'
          });
        }
      }
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

    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Verkaufspreis muss größer oder gleich 0 sein';
    }

    if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Einkaufspreis muss größer oder gleich 0 sein';
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))',
          borderRadius: isMobile ? 0 : '12px',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          height: isMobile ? '100%' : 'auto'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: 'white', 
          fontWeight: 600,
          px: isMobile ? 2 : 3,
          py: 2,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 1200
        }}
      >
        {title}
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            },
            padding: isMobile ? '8px' : '4px'
          }}
        >
          <CloseIcon fontSize={isMobile ? "medium" : "small"} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogContent 
          sx={{ 
            p: isMobile ? 2 : 3,
            overflowY: 'auto',
            height: isMobile ? 'calc(100% - 130px)' : 'auto',
            msOverflowStyle: 'none',  /* IE and Edge */
            scrollbarWidth: 'thin',   /* Firefox */
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          <Grid container spacing={isMobile ? 2 : 3}>
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
                variant="outlined"
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                InputProps={{
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    }
                  }
                }}
              />
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
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    },
                    '& .MuiInputAdornment-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice}
              />
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
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    },
                    '& .MuiInputAdornment-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Bestand"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                InputProps={{
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    }
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                error={!!errors.stock}
                helperText={errors.stock}
              />
              <FormControl 
                fullWidth 
                margin="dense" 
                error={!!errors.category_id}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9B7EE0',
                  }
                }}
              >
                <InputLabel id="category-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Kategorie</InputLabel>
                <Select
                  labelId="category-label"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleChange}
                  label="Kategorie"
                  disabled={loadingCategories}
                  sx={{ color: 'white' }}
                >
                  {loadingCategories ? (
                    <MenuItem value="" disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography>Kategorien werden geladen...</Typography>
                      </Box>
                    </MenuItem>
                  ) : categories.length === 0 ? (
                    <MenuItem value="" disabled>
                      <Typography>Keine Kategorien verfügbar</Typography>
                    </MenuItem>
                  ) : (
                    categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.category_id && (
                  <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                    <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {errors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Produkt-URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
                InputProps={{
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    }
                  }
                }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 3 : 5}
                margin="dense"
                label="Beschreibung"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                variant="outlined"
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                InputProps={{
                  sx: { 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9B7EE0',
                    }
                  }
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Bildvorschau
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: isMobile ? 150 : 200, 
                    backgroundColor: 'rgba(20, 20, 20, 0.8)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Produktvorschau" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain' 
                      }} 
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Kein Bild ausgewählt
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: isMobile ? 2 : 3, 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            position: isMobile ? 'sticky' : 'static',
            bottom: 0,
            zIndex: 1100,
            flexDirection: isMobile ? 'column-reverse' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <Button 
            onClick={onClose}
            fullWidth={isMobile}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'white'
              },
              borderRadius: '8px',
              px: 3,
              py: isMobile ? 1.5 : 1
            }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            fullWidth={isMobile}
            sx={{
              backgroundColor: '#6200ea',
              '&:hover': { backgroundColor: '#5000d1' },
              borderRadius: '8px',
              px: 3,
              py: isMobile ? 1.5 : 1,
              boxShadow: '0 4px 12px rgba(98, 0, 234, 0.4)'
            }}
          >
            Speichern
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
