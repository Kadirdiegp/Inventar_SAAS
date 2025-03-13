import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Chip,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={product.imageUrl || '/placeholder.jpg'}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 1, backgroundColor: '#f5f5f5' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {product.name}
          </Typography>
          <Chip 
            label={product.category} 
            size="small" 
            sx={{ backgroundColor: '#e0e0ff', color: '#3700b3' }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '40px', overflow: 'hidden' }}>
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Verkaufspreis (brutto):
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {formatCurrency(product.sellingPrice)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Verfügbarer Bestand:
          </Typography>
          <Chip 
            label={`${product.stock} Stück`} 
            size="small"
            color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
          />
        </Box>
      </CardContent>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="Bearbeiten">
          <IconButton 
            size="small" 
            onClick={() => onEdit(product)}
            sx={{ color: '#6200ea' }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Löschen">
          <IconButton 
            size="small" 
            onClick={() => onDelete(product.id)}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default ProductCard;
