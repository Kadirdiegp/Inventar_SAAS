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
  ListItemSecondaryAction,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Checkbox,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Partner } from '../../types';
import { Product, fetchProductsByPartner, fetchAvailableProductsForPartner, addProductToPartner, removeProductFromPartner } from '../../services/productService';
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Produkte für {partner.name} verwalten
        </Typography>
      </DialogTitle>

      <DialogContent>
        {alertInfo && (
          <Alert
            severity={alertInfo.type}
            sx={{ mb: 2 }}
            onClose={() => setAlertInfo(null)}
          >
            {alertInfo.message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant={activeTab === 'current' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('current')}
                    startIcon={<ShoppingCartIcon />}
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
                  >
                    Produkte hinzufügen ({availableProducts.length})
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {activeTab === 'current' ? (
              // Aktuelle Produkte des Partners
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Produkte des Partners
                </Typography>
                
                {partnerProducts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine Produkte mit diesem Partner verknüpft.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Wechseln Sie zur "Produkte hinzufügen" Ansicht, um Produkte hinzuzufügen.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {partnerProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                {product.category && (
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    sx={{ ml: 1, backgroundColor: '#e0e0ff', color: '#3700b3' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 1 }}>
                                <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Verkaufspreis (brutto):
                                  </Typography>
                                  <Typography component="span" variant="body2" fontWeight="bold" color="primary">
                                    {formatCurrency(product.sellingPrice)}
                                  </Typography>
                                </Box>
                                <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Verfügbarer Bestand:
                                  </Typography>
                                  <Chip 
                                    label={`${product.stock} Stück`} 
                                    size="small"
                                    color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => removeProductFromPartnerHandler(product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            ) : (
              // Verfügbare Produkte zum Hinzufügen
              <>
                <Box sx={{ mb: 2 }}>
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
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Verfügbare Produkte ({filteredAvailableProducts.length})
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedProductIds.length === 0}
                    startIcon={<AddIcon />}
                    onClick={addSelectedProductsToPartner}
                  >
                    {selectedProductIds.length} Produkte hinzufügen
                  </Button>
                </Box>

                {filteredAvailableProducts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine Produkte verfügbar.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {availableProducts.length === 0 
                        ? "Alle verfügbaren Produkte wurden bereits hinzugefügt."
                        : "Versuchen Sie, Ihre Suchkriterien zu ändern."}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedProductIds.length === filteredAvailableProducts.length && filteredAvailableProducts.length > 0}
                          indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < filteredAvailableProducts.length}
                          onChange={handleSelectAll}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Alle auswählen</Typography>}
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    {filteredAvailableProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => handleProductSelection(product.id)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                {product.category && (
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    sx={{ ml: 1, backgroundColor: '#e0e0ff', color: '#3700b3' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 1 }}>
                                <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Verkaufspreis (brutto):
                                  </Typography>
                                  <Typography component="span" variant="body2" fontWeight="bold" color="primary">
                                    {formatCurrency(product.sellingPrice)}
                                  </Typography>
                                </Box>
                                <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Verfügbarer Bestand:
                                  </Typography>
                                  <Chip 
                                    label={`${product.stock} Stück`} 
                                    size="small"
                                    color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
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

export default PartnerProductManager;
