import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  InputAdornment, 
  Box,
  Alert,
  CircularProgress,
  Typography,
  Container,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import PartnerList from '../components/partners/PartnerList';
import PartnerForm from '../components/partners/PartnerForm';
import PartnerDetail from '../components/partners/PartnerDetail';
import PartnerProductManager from '../components/partners/PartnerProductManager';
import { Partner } from '../types';
import { fetchPartners, createPartner, updatePartner, deletePartner } from '../services/partnerService';

const Partners: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | undefined>(undefined);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [productManagerOpen, setProductManagerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const loadedPartners = await fetchPartners();
      setPartners(loadedPartners);
      setFilteredPartners(loadedPartners);
    } catch (error) {
      console.error('Fehler beim Laden der Partner:', error);
      showAlert('error', 'Fehler beim Laden der Partner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = partners.filter(partner => 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPartners(filtered);
    } else {
      setFilteredPartners(partners);
    }
  }, [partners, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddPartner = () => {
    setCurrentPartner(undefined);
    setFormOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setCurrentPartner(partner);
    setFormOpen(true);
  };

  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Partner löschen möchten?')) {
      setLoading(true);
      try {
        await deletePartner(id);
        await loadPartners();
        showAlert('success', 'Partner erfolgreich gelöscht');
      } catch (error) {
        console.error('Fehler beim Löschen des Partners:', error);
        showAlert('error', 'Fehler beim Löschen des Partners');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSavePartner = async (partner: Omit<Partner, 'id'> | Partner) => {
    setLoading(true);
    try {
      if ('id' in partner) {
        await updatePartner(partner as Partner);
        showAlert('success', 'Partner erfolgreich aktualisiert');
      } else {
        await createPartner(partner);
        showAlert('success', 'Partner erfolgreich hinzugefügt');
      }
      await loadPartners();
      setFormOpen(false);
    } catch (error) {
      showAlert('error', 'Fehler beim Speichern des Partners');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner);
    setDetailOpen(true);
  };

  const handleAddProductToPartner = (partnerId: string) => {
    // Suche den Partner mit der übereinstimmenden ID
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setSelectedPartner(partner);
      setDetailOpen(false); // Detail-Dialog schließen
      setProductManagerOpen(true);
    }
  };

  const handleProductManagerClosed = () => {
    setProductManagerOpen(false);
    // Detail-Dialog wieder öffnen, wenn der Partner noch ausgewählt ist
    if (selectedPartner) {
      setDetailOpen(true);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 3000);
  };

  return (
    <Box sx={{ 
      background: 'black',
      minHeight: '100vh',
      py: 2,
      px: isMobile ? 1 : 3
    }}>
      <Container maxWidth="lg" sx={{ pt: 1 }}>
        <PageHeader 
          title="Partner" 
          subtitle="Verwalten Sie Ihre Geschäftspartner und Kunden"
          action={{
            label: "Partner hinzufügen",
            onClick: handleAddPartner
          }}
        />
        
        {alertInfo && (
          <Alert 
            severity={alertInfo.type} 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
            onClose={() => setAlertInfo(null)}
          >
            {alertInfo.message}
          </Alert>
        )}
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: isMobile ? 2 : 3, 
            mb: 4, 
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <TextField
            fullWidth
            placeholder="Partner suchen..."
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
              mb: isMobile ? 2 : 3,
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
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : partners.length === 0 || filteredPartners.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              my: 8,
              p: 3,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h6" color="rgba(255, 255, 255, 0.8)" align="center" fontWeight={500}>
                {partners.length === 0 
                  ? 'Fügen Sie Partner hinzu, um Ihre Geschäftsbeziehungen zu verwalten' 
                  : 'Versuchen Sie, Ihre Suchkriterien zu ändern'}
              </Typography>
            </Box>
          ) : (
            <PartnerList
              partners={filteredPartners}
              onEdit={handleEditPartner}
              onDelete={handleDeletePartner}
              onView={handleViewPartnerDetail}
            />
          )}
        </Paper>
        
        <PartnerForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSavePartner}
          partner={currentPartner}
          title={currentPartner ? "Partner bearbeiten" : "Neuen Partner hinzufügen"}
        />
        
        {selectedPartner && (
          <>
            <PartnerDetail
              open={detailOpen}
              onClose={() => setDetailOpen(false)}
              partner={selectedPartner}
              onAddProductToPartner={handleAddProductToPartner}
            />
            
            <PartnerProductManager
              open={productManagerOpen}
              onClose={handleProductManagerClosed}
              partner={selectedPartner}
              onProductsUpdated={loadPartners}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default Partners;
