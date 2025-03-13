import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider
} from '@mui/material';
import { ProductCategory, fetchCategories } from '../../services/categoryService';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';

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
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProductCategoryFilterProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  showActionButton?: boolean;
  actionButtonText?: string;
  hideEmptyCategories?: boolean;
}

const ProductCategoryFilter: React.FC<ProductCategoryFilterProps> = ({
  products,
  onProductSelect,
  showActionButton = false,
  actionButtonText = 'Auswählen',
  hideEmptyCategories = true
}) => {
  const [value, setValue] = useState(0);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categorizedProducts, setCategorizedProducts] = useState<{[key: string]: Product[]}>({
    'all': [],
    'uncategorized': []
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        console.log('Kategorien im ProductCategoryFilter geladen:', data);
        setCategories(data);
        
        // Vorbereitete Kategoriezuordnungen für alle Produkte
        const productsByCategory: {[key: string]: Product[]} = {
          'all': products,
          'uncategorized': products.filter(p => !p.category_id)
        };
        
        // Produkte pro Kategorie gruppieren
        data.forEach(category => {
          productsByCategory[category.id] = products.filter(
            product => product.category_id === category.id
          );
        });
        
        setCategorizedProducts(productsByCategory);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };
    
    loadCategories();
  }, [products]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const getTypeChipColor = (type: string | undefined) => {
    switch(type) {
      case 'IMPORT':
        return 'primary';
      case 'EXPORT':
        return 'secondary';
      case 'BOTH':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Produktkategorien"
        >
          <Tab label="Alle Produkte" />
          <Tab label="Nicht kategorisiert" />
          {categories.map((category, index) => (
            // Verstecke leere Kategorien, wenn gewünscht
            (!hideEmptyCategories || (categorizedProducts[category.id] && categorizedProducts[category.id].length > 0)) && (
              <Tab 
                key={category.id} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {category.name}
                    <Chip 
                      size="small"
                      label={category.type} 
                      color={getTypeChipColor(category.type) as any}
                      sx={{ ml: 1, minWidth: 60 }}
                    />
                  </Box>
                } 
              />
            )
          ))}
        </Tabs>
      </Box>

      {/* Alle Produkte Tab */}
      <TabPanel value={value} index={0}>
        <ProductGrid 
          products={categorizedProducts['all'] || []} 
          onProductSelect={onProductSelect}
          showActionButton={showActionButton}
          actionButtonText={actionButtonText}
        />
      </TabPanel>

      {/* Nicht kategorisierte Produkte Tab */}
      <TabPanel value={value} index={1}>
        <ProductGrid 
          products={categorizedProducts['uncategorized'] || []} 
          onProductSelect={onProductSelect}
          showActionButton={showActionButton}
          actionButtonText={actionButtonText}
        />
      </TabPanel>

      {/* Dynamische Tabs für Kategorien */}
      {categories.map((category, index) => (
        (!hideEmptyCategories || (categorizedProducts[category.id] && categorizedProducts[category.id].length > 0)) && (
          <TabPanel key={category.id} value={value} index={index + 2}>
            <ProductGrid 
              products={categorizedProducts[category.id] || []} 
              onProductSelect={onProductSelect}
              showActionButton={showActionButton}
              actionButtonText={actionButtonText}
            />
          </TabPanel>
        )
      ))}
    </Box>
  );
};

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  showActionButton: boolean;
  actionButtonText: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onProductSelect,
  showActionButton,
  actionButtonText
}) => {
  const getStockChipColor = (stock: number) => {
    if (stock <= 0) return 'error';
    if (stock < 5) return 'warning';
    return 'success';
  };

  if (products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          Keine Produkte in dieser Kategorie
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {product.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Chip 
                  label={`Bestand: ${product.stock}`} 
                  color={getStockChipColor(product.stock) as any} 
                  size="small"
                />
                {product.categoryName && (
                  <Chip 
                    label={product.categoryName} 
                    color={product.categoryType === 'IMPORT' ? 'primary' : 'secondary'} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Verkauf: {formatCurrency(product.sellingPrice)}
                </Typography>
              </Box>
            </CardContent>
            {showActionButton && onProductSelect && (
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained" 
                  fullWidth
                  onClick={() => onProductSelect(product)}
                >
                  {actionButtonText}
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductCategoryFilter;
