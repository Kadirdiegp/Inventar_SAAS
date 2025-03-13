import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { Partner } from '../../types';

interface PartnerListProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onView: (partner: Partner) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ partners, onEdit, onDelete, onView }) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kontaktperson</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>E-Mail</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Telefon</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Adresse</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partners.map((partner) => (
            <TableRow 
              key={partner.id} 
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => onView(partner)}
            >
              <TableCell>{partner.name}</TableCell>
              <TableCell>{partner.contact}</TableCell>
              <TableCell>{partner.email}</TableCell>
              <TableCell>{partner.phone}</TableCell>
              <TableCell>{partner.address}</TableCell>
              <TableCell align="right">
                <Box onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Details anzeigen">
                    <IconButton 
                      color="info" 
                      onClick={() => onView(partner)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit(partner)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton 
                      color="error" 
                      onClick={() => onDelete(partner.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PartnerList;
