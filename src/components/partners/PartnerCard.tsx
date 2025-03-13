import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Divider,
  Tooltip,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Partner } from '../../types';

interface PartnerCardProps {
  partner: Partner;
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onEdit, onDelete }) => {
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
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: '#6200ea', 
              width: 56, 
              height: 56,
              mr: 2
            }}
          >
            {partner.name.substring(0, 1)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {partner.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {partner.contact}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon fontSize="small" sx={{ color: '#6200ea', mr: 1 }} />
          <Typography variant="body2">
            {partner.email}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PhoneIcon fontSize="small" sx={{ color: '#6200ea', mr: 1 }} />
          <Typography variant="body2">
            {partner.phone}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <LocationIcon fontSize="small" sx={{ color: '#6200ea', mr: 1, mt: 0.5 }} />
          <Typography variant="body2">
            {partner.address}
          </Typography>
        </Box>
        
        {partner.notes && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {partner.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="Bearbeiten">
          <IconButton 
            size="small" 
            onClick={() => onEdit(partner)}
            sx={{ color: '#6200ea' }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Löschen">
          <IconButton 
            size="small" 
            onClick={() => onDelete(partner.id)}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default PartnerCard;
