import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import ProductCard from '../components/inventory/ProductCard';
import ProductForm from '../components/inventory/ProductForm';
import { Product } from '../types';
import { filterProducts } from '../utils/helpers';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { fetchCategories } from '../services/categoryService';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(['all']);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const loadedProducts = await fetchProducts();
      setProducts(loadedProducts);
      setFilteredProducts(loadedProducts);
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      showAlert('error', 'Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchCategories();
      // Füge 'all' als erste Option hinzu und extrahiere dann die Namen der Kategorien
      setCategories(['all', ...categoriesData.map(cat => cat.name)]);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    setFilteredProducts(filterProducts(products, searchTerm, categoryFilter === 'all' ? undefined : categoryFilter));
  }, [products, searchTerm, categoryFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: any) => {
    setCategoryFilter(e.target.value);
  };

  const handleAddProduct = () => {
    setCurrentProduct(undefined);
    setFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      setLoading(true);
      try {
        await deleteProduct(id);
        await loadProducts();
        showAlert('success', 'Produkt erfolgreich gelöscht');
      } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        showAlert('error', 'Fehler beim Löschen des Produkts');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveProduct = async (product: Omit<Product, 'id'> | Product) => {
    setLoading(true);
    try {
      if ('id' in product) {
        await updateProduct(product as Product);
        showAlert('success', 'Produkt erfolgreich aktualisiert');
      } else {
        await createProduct(product);
        showAlert('success', 'Produkt erfolgreich hinzugefügt');
      }
      await loadProducts();
      setFormOpen(false);
    } catch (error) {
      showAlert('error', 'Fehler beim Speichern des Produkts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 3000);
  };

  return (
    <>
      <PageHeader 
        title="Inventar" 
        subtitle="Verwalten Sie Ihre Produkte und Bestände"
        action={{
          label: "Produkt hinzufügen",
          onClick: handleAddProduct
        }}
      />
      
      {alertInfo && (
        <Alert 
          severity={alertInfo.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlertInfo(null)}
        >
          {alertInfo.message}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Kategorie"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'Alle Kategorien' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Keine Produkte gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products.length === 0 
              ? 'Fügen Sie Produkte hinzu, um Ihr Inventar zu verwalten' 
              : 'Versuchen Sie, Ihre Suchkriterien zu ändern'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveProduct}
        product={currentProduct}
        title={currentProduct ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}
      />
    </>
  );
};

export default Inventory;
