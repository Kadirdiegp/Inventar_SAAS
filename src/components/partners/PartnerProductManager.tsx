import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Partner } from '../../types';
import { Product, fetchProductsByPartner, fetchAvailableProductsForPartner, addProductToPartner, removeProductFromPartner, updatePartnerPrice } from '../../services/productService';
import { ProductCategory, fetchCategories } from '../../services/categoryService';
import { formatCurrency } from '../../utils/helpers';

interface PartnerProductManagerProps {
  open: boolean;
  onClose: () => void;
  partner: Partner;
  onProductsUpdated?: () => void;
}

const PartnerProductManager: React.FC<PartnerProductManagerProps> = ({
  open,
  onClose,
  partner,
  onProductsUpdated
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailableProducts, setFilteredAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingPartnerPrice, setEditingPartnerPrice] = useState<{productId: string, price: number | null} | null>(null);

  // Alert-Funktion
  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 3000);
  }, []);

  // Kategorien laden
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };
    loadCategories();
  }, []);

  // Filterfunktion mit Kategorie
  const filterProducts = useCallback(() => {
    let filtered = availableProducts;
    
    // Nach Suchbegriff filtern
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
    
    // Nach Kategorie filtern
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category_id === selectedCategory
      );
    }
    
    setFilteredAvailableProducts(filtered);
  }, [availableProducts, searchTerm, selectedCategory]);

  // Daten laden
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentProducts, productsToAdd] = await Promise.all([
        fetchProductsByPartner(partner.id),
        fetchAvailableProductsForPartner(partner.id)
      ]);
      
      setPartnerProducts(currentProducts);
      setAvailableProducts(productsToAdd);
      setFilteredAvailableProducts(productsToAdd);
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      showAlert('error', 'Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  }, [partner.id, showAlert]);

  // Wenn sich die Suchbegriffe ändern, neu filtern
  useEffect(() => {
    filterProducts();
  }, [filterProducts, searchTerm, selectedCategory]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, partner.id, loadData]);

  // Suche in verfügbaren Produkten
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProductIds(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredAvailableProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredAvailableProducts.map(product => product.id));
    }
  };

  const removeProductFromPartnerHandler = async (productId: string) => {
    if (window.confirm('Möchten Sie dieses Produkt wirklich vom Partner entfernen?')) {
      setLoading(true);
      try {
        await removeProductFromPartner(partner.id, productId);
        showAlert('success', 'Produkt erfolgreich vom Partner entfernt');
        loadData();
        if (onProductsUpdated) onProductsUpdated();
      } catch (error) {
        console.error('Fehler beim Entfernen des Produkts:', error);
        showAlert('error', 'Fehler beim Entfernen des Produkts');
      } finally {
        setLoading(false);
      }
    }
  };

  const updatePartnerPriceHandler = async (productId: string, price: number) => {
    setLoading(true);
    try {
      // Verwende die neue updatePartnerPrice-Funktion
      const success = await updatePartnerPrice(partner.id, productId, price);
      
      if (success) {
        showAlert('success', 'Kundenpreis erfolgreich aktualisiert');
        loadData();
        setEditingPartnerPrice(null);
        if (onProductsUpdated) onProductsUpdated();
      } else {
        showAlert('error', 'Fehler beim Aktualisieren des Kundenpreises');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kundenpreises:', error);
      showAlert('error', 'Fehler beim Aktualisieren des Kundenpreises');
    } finally {
      setLoading(false);
    }
  };

  const addSelectedProductsToPartner = async () => {
    if (selectedProductIds.length === 0) {
      showAlert('error', 'Bitte wählen Sie mindestens ein Produkt aus');
      return;
    }

    setLoading(true);
    try {
      // Produkte nacheinander hinzufügen
      for (const productId of selectedProductIds) {
        await addProductToPartner(partner.id, productId);
      }
      
      showAlert('success', `${selectedProductIds.length} Produkt(e) erfolgreich zum Partner hinzugefügt`);
      loadData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Produkte:', error);
      showAlert('error', 'Fehler beim Hinzufügen der Produkte');
    } finally {
      setLoading(false);
    }
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
          borderRadius: isMobile ? 0 : '12px',
          bgcolor: 'black',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: isMobile ? 2 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: 'black'
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ 
          fontWeight: 'bold',
          color: 'white'
        }}>
          Produkte für {partner.name} verwalten
        </Typography>
        {isMobile && (
          <IconButton edge="end" sx={{ color: 'white' }} onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3, pt: 3, bgcolor: 'transparent' }}>
        {alertInfo && (
          <Alert
            severity={alertInfo.type}
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
            onClose={() => setAlertInfo(null)}
          >
            {alertInfo.message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant={activeTab === 'current' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('current')}
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: '50px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: activeTab === 'current' ? '0 4px 12px rgba(255, 255, 255, 0.2)' : 0,
                      backgroundColor: activeTab === 'current' ? 'white' : 'transparent',
                      borderColor: 'white',
                      color: activeTab === 'current' ? 'black' : 'white',
                      '&:hover': {
                        backgroundColor: activeTab === 'current' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                      }
                    }}
                  >
                    Aktuelle Produkte ({partnerProducts.length})
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant={activeTab === 'available' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('available')}
                    startIcon={<AddIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: '50px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: activeTab === 'available' ? '0 4px 12px rgba(255, 255, 255, 0.2)' : 0,
                      backgroundColor: activeTab === 'available' ? 'white' : 'transparent',
                      borderColor: 'white',
                      color: activeTab === 'available' ? 'black' : 'white',
                      '&:hover': {
                        backgroundColor: activeTab === 'available' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                      }
                    }}
                  >
                    Produkte hinzufügen ({availableProducts.length})
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {activeTab === 'current' ? (
              // Aktuelle Produkte des Partners
              <>
                <Typography variant="h6" gutterBottom sx={{ 
                  mt: 2, 
                  mb: 3,
                  fontWeight: 600,
                  color: 'white'
                }}>
                  Produkte des Partners
                </Typography>
                
                {partnerProducts.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6, 
                    px: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography variant="body1" color="rgba(255, 255, 255, 0.8)" fontWeight={500}>
                      Keine Produkte mit diesem Partner verknüpft.
                    </Typography>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mt: 1 }}>
                      Wechseln Sie zur "Produkte hinzufügen" Ansicht, um Produkte hinzuzufügen.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    width: '100%', 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {partnerProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem 
                          sx={{ 
                            py: 2.5, 
                            px: isMobile ? 2 : 3,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              width: '60px',
                              height: '100%',
                              background: 'transparent',
                              zIndex: 1
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{product.name}</Typography>
                                {product.category && (
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white',
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 1.5 }}>
                                {/* Preise und Bestand in Grid-Layout anordnen */}
                                <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                  <Grid item xs={5}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Verkaufspreis (brutto):
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={7} sx={{ textAlign: 'right', paddingRight: '30px' }}>
                                    <Typography component="span" variant="body2" fontWeight="bold" color="white">
                                      {formatCurrency(product.sellingPrice)}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                  <Grid item xs={5}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Verfügbarer Bestand:
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={7} sx={{ textAlign: 'right', paddingRight: '30px' }}>
                                    <Chip 
                                      label={`${product.stock} Stück`} 
                                      size="small"
                                      sx={{
                                        fontWeight: 500,
                                        bgcolor: product.stock > 10 ? 'rgba(0, 200, 83, 0.1)' : product.stock > 0 ? 'rgba(247, 159, 31, 0.1)' : 'rgba(245, 101, 101, 0.1)',
                                        color: product.stock > 10 ? 'white' : product.stock > 0 ? 'white' : 'white'
                                      }}
                                    />
                                  </Grid>
                                </Grid>

                                {/* Kundenpreis Anzeige und Bearbeitung */}
                                <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                  <Grid item xs={5}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Kundenpreis:
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={7} sx={{ textAlign: 'right', paddingRight: '30px' }}>
                                    {editingPartnerPrice && editingPartnerPrice.productId === product.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                        <TextField
                                          value={editingPartnerPrice.price === null ? '' : editingPartnerPrice.price}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const numValue = value === '' ? null : parseFloat(value);
                                            setEditingPartnerPrice({
                                              ...editingPartnerPrice,
                                              price: numValue
                                            });
                                          }}
                                          type="number"
                                          size="small"
                                          inputProps={{ 
                                            min: 0, 
                                            step: 0.01,
                                            style: { color: 'white' }
                                          }}
                                          sx={{ 
                                            width: '100px',
                                            '& .MuiOutlinedInput-root': {
                                              '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                              },
                                              '&:hover fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                              },
                                              '&.Mui-focused fieldset': {
                                                borderColor: 'white',
                                              },
                                            }
                                          }}
                                          placeholder="Preis"
                                          InputProps={{
                                            endAdornment: <InputAdornment position="end">€</InputAdornment>,
                                          }}
                                        />
                                        <Box>
                                          <IconButton 
                                            size="small" 
                                            sx={{ color: 'rgb(76, 175, 80)' }}
                                            onClick={() => {
                                              if (editingPartnerPrice.price !== null) {
                                                updatePartnerPriceHandler(product.id, editingPartnerPrice.price);
                                              }
                                            }}
                                          >
                                            <CheckIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton 
                                            size="small" 
                                            sx={{ color: 'rgb(244, 67, 54)' }}
                                            onClick={() => setEditingPartnerPrice(null)}
                                          >
                                            <CloseIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                        <Typography 
                                          component="span" 
                                          variant="body2" 
                                          fontWeight="bold" 
                                          color={product.partnerPrice ? 'white' : 'rgba(255, 255, 255, 0.4)'}
                                        >
                                          {product.partnerPrice ? formatCurrency(product.partnerPrice) : 'Nicht gesetzt'}
                                        </Typography>
                                        <IconButton 
                                          size="small" 
                                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                          onClick={() => setEditingPartnerPrice({
                                            productId: product.id,
                                            price: product.partnerPrice || null
                                          })}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Grid>
                                </Grid>
                              </Box>
                            }
                          />
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => removeProductFromPartnerHandler(product.id)}
                            sx={{
                              bgcolor: 'rgba(245, 101, 101, 0.1)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(245, 101, 101, 0.2)',
                              },
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              zIndex: 2
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                        <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            ) : (
              // Verfügbare Produkte zum Hinzufügen
              <>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        placeholder="Produkte suchen..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'white',
                            },
                            '& input::placeholder': {
                              color: 'rgba(255, 255, 255, 0.5)',
                            }
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                        '& .MuiMenuItem-root': {
                          color: 'black',
                        }
                      }}>
                        <InputLabel id="category-label">Kategorie</InputLabel>
                        <Select
                          labelId="category-label"
                          value={selectedCategory}
                          label="Kategorie"
                          onChange={(e) => setSelectedCategory(e.target.value as string)}
                        >
                          <MenuItem value="">Alle Kategorien</MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 2 : 0
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    mb: isMobile ? 1 : 0
                  }}>
                    Verfügbare Produkte ({filteredAvailableProducts.length})
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedProductIds.length === 0}
                    startIcon={<AddIcon />}
                    onClick={addSelectedProductsToPartner}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: '50px',
                      backgroundColor: 'white',
                      fontWeight: 600,
                      color: 'black',
                      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        color: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    {selectedProductIds.length} Produkte hinzufügen
                  </Button>
                </Box>

                {filteredAvailableProducts.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6, 
                    px: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography variant="body1" color="rgba(255, 255, 255, 0.8)" fontWeight={500}>
                      Keine Produkte verfügbar.
                    </Typography>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mt: 1 }}>
                      {availableProducts.length === 0 
                        ? "Alle verfügbaren Produkte wurden bereits hinzugefügt."
                        : "Versuchen Sie, Ihre Suchkriterien zu ändern."}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    width: '100%', 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <ListItem sx={{ 
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedProductIds.length === filteredAvailableProducts.length && filteredAvailableProducts.length > 0}
                          indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < filteredAvailableProducts.length}
                          onChange={handleSelectAll}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&.Mui-checked': {
                              color: 'white',
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: 'white',
                            }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="rgba(255, 255, 255, 0.7)" fontWeight={500}>Alle auswählen</Typography>}
                      />
                    </ListItem>
                    
                    {filteredAvailableProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem sx={{ py: 2.5, px: isMobile ? 2 : 3, paddingRight: isMobile ? '60px' : '70px' }}>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => handleProductSelection(product.id)}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                '&.Mui-checked': {
                                  color: 'white',
                                }
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{product.name}</Typography>
                                {product.category && (
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white',
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 1.5 }}>
                                {/* Preise und Bestand in Grid-Layout anordnen */}
                                <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                  <Grid item xs={6}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Verkaufspreis (brutto):
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                    <Typography component="span" variant="body2" fontWeight="bold" color="white">
                                      {formatCurrency(product.sellingPrice)}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                  <Grid item xs={6}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Verfügbarer Bestand:
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                    <Chip 
                                      label={`${product.stock} Stück`} 
                                      size="small"
                                      sx={{
                                        fontWeight: 500,
                                        bgcolor: product.stock > 0 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(211, 47, 47, 0.2)',
                                        color: product.stock > 0 ? 'rgb(76, 175, 80)' : 'rgb(244, 67, 54)',
                                        border: product.stock > 0 ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(244, 67, 54, 0.5)'
                                      }}
                                    />
                                  </Grid>
                                </Grid>

                                {/* Kundenpreis Anzeige und Bearbeitung */}
                                <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                  <Grid item xs={6}>
                                    <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.6)">
                                      Kundenpreis:
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                    {editingPartnerPrice && editingPartnerPrice.productId === product.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                        <TextField
                                          value={editingPartnerPrice.price === null ? '' : editingPartnerPrice.price}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const numValue = value === '' ? null : parseFloat(value);
                                            setEditingPartnerPrice({
                                              ...editingPartnerPrice,
                                              price: numValue
                                            });
                                          }}
                                          type="number"
                                          size="small"
                                          inputProps={{ 
                                            min: 0, 
                                            step: 0.01,
                                            style: { color: 'white' }
                                          }}
                                          sx={{ 
                                            width: '100px',
                                            '& .MuiOutlinedInput-root': {
                                              '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                              },
                                              '&:hover fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                              },
                                              '&.Mui-focused fieldset': {
                                                borderColor: 'white',
                                              },
                                            }
                                          }}
                                          placeholder="Preis"
                                          InputProps={{
                                            endAdornment: <InputAdornment position="end">€</InputAdornment>,
                                          }}
                                        />
                                        <Box>
                                          <IconButton 
                                            size="small" 
                                            sx={{ color: 'rgb(76, 175, 80)' }}
                                            onClick={() => {
                                              if (editingPartnerPrice.price !== null) {
                                                updatePartnerPriceHandler(product.id, editingPartnerPrice.price);
                                              }
                                            }}
                                          >
                                            <CheckIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton 
                                            size="small" 
                                            sx={{ color: 'rgb(244, 67, 54)' }}
                                            onClick={() => setEditingPartnerPrice(null)}
                                          >
                                            <CloseIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                        <Typography 
                                          component="span" 
                                          variant="body2" 
                                          fontWeight="bold" 
                                          color={product.partnerPrice ? 'white' : 'rgba(255, 255, 255, 0.4)'}
                                        >
                                          {product.partnerPrice ? formatCurrency(product.partnerPrice) : 'Nicht gesetzt'}
                                        </Typography>
                                        <IconButton 
                                          size="small" 
                                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                          onClick={() => setEditingPartnerPrice({
                                            productId: product.id,
                                            price: product.partnerPrice || null
                                          })}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Grid>
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: isMobile ? 2 : 3, 
        pt: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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

export default PartnerProductManager;
