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
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Stack
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Partner } from '../../types';

interface PartnerListProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onView: (partner: Partner) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ partners, onEdit, onDelete, onView }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mobile Kartenansicht
  const PartnerCards = () => (
    <Grid container spacing={2}>
      {partners.map((partner) => (
        <Grid item xs={12} key={partner.id}>
          <Card 
            sx={{ 
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)', 
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onClick={() => onView(partner)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {partner.name}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Details anzeigen">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(partner);
                      }}
                      size="small"
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(partner);
                      }}
                      size="small"
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(partner.id);
                      }}
                      size="small"
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Grid container spacing={1}>
                {partner.contact && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>{partner.contact}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {partner.email && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>{partner.email}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {partner.phone && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>{partner.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {partner.address && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PlaceIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Typography variant="body2" sx={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'white'
                      }}>
                        {partner.address}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Desktop Tabellenansicht
  const PartnerTable = () => (
    <TableContainer component={Paper} sx={{ 
      boxShadow: 3, 
      borderRadius: 2, 
      backgroundColor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <Table>
        <TableHead sx={{ backgroundColor: 'black', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kontaktperson</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>E-Mail</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Telefon</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Adresse</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          {partners.map((partner) => (
            <TableRow 
              key={partner.id} 
              hover
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  color: 'white'
                }
              }}
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
                      onClick={() => onView(partner)}
                      size="small"
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton 
                      onClick={() => onEdit(partner)}
                      size="small"
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton 
                      onClick={() => onDelete(partner.id)}
                      size="small"
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
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

  // Je nach Bildschirmgröße die entsprechende Ansicht zurückgeben
  return isMobile ? <PartnerCards /> : <PartnerTable />;
};

export default PartnerList;
