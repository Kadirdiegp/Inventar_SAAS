import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.25)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={product.imageUrl || '/placeholder.jpg'}
        alt={product.name}
        sx={{ 
          objectFit: 'contain', 
          p: 1, 
          backgroundColor: 'rgba(20, 20, 20, 0.8)'
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: isMobile ? '1rem' : '1.1rem',
              mb: 0
            }}
          >
            {product.name}
          </Typography>
          <Chip 
            label={product.category} 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(128, 90, 213, 0.2)', 
              color: '#9B7EE0',
              fontWeight: 'medium',
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2, 
            height: '40px', 
            overflow: 'hidden',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            lineHeight: '1.43'
          }}
        >
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}
          >
            Verkaufspreis (brutto):
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold" 
            sx={{ 
              color: '#F69931',
              fontSize: '0.875rem'
            }}
          >
            {formatCurrency(product.sellingPrice)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}
          >
            Verfügbarer Bestand:
          </Typography>
          <Chip 
            label={`${product.stock} Stück`} 
            size="small"
            sx={{
              height: '22px',
              fontSize: '0.75rem',
              fontWeight: 'medium',
              backgroundColor: product.stock > 10 
                ? 'rgba(46, 202, 134, 0.2)'
                : product.stock > 0 
                  ? 'rgba(246, 153, 49, 0.2)'
                  : 'rgba(244, 67, 54, 0.2)',
              color: product.stock > 10 
                ? '#2ECA86'
                : product.stock > 0 
                  ? '#F69931'
                  : '#f44336'
            }}
          />
        </Box>
      </CardContent>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Tooltip title="Bearbeiten">
          <IconButton 
            size="small" 
            onClick={() => onEdit(product)}
            sx={{ 
              color: '#9B7EE0',
              '&:hover': {
                backgroundColor: 'rgba(128, 90, 213, 0.1)'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Löschen">
          <IconButton 
            size="small" 
            onClick={() => onDelete(product.id)}
            sx={{ 
              color: '#f44336',
              ml: 1,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default ProductCard;
