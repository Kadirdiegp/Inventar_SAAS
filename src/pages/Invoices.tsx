import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  InputAdornment, 
  Box,
  Typography,
  Alert,
  Button
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoicePreview from '../components/invoices/InvoicePreview';
import { Invoice, Partner } from '../types';
import { getInvoices, saveInvoice, updateInvoice, deleteInvoice, getPartners } from '../utils/storage';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | undefined>(undefined);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const filterInvoices = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(invoice => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        invoice.partnerName.toLowerCase().includes(searchTermLower) ||
        invoice.date.toLowerCase().includes(searchTermLower) ||
        invoice.status.toLowerCase().includes(searchTermLower)
      );
    });

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm]);

  useEffect(() => {
    loadInvoices();
    loadPartners();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [filterInvoices]);

  const loadInvoices = async () => {
    const loadedInvoices = await getInvoices();
    setInvoices(loadedInvoices);
    setFilteredInvoices(loadedInvoices);
  };

  const loadPartners = async () => {
    const loadedPartners = await getPartners();
    setPartners(loadedPartners);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddInvoice = () => {
    setCurrentInvoice(undefined);
    setFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setFormOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setViewOpen(true);
  };

  const handleGeneratePdf = (invoice: Invoice) => {
    // Simulate PDF generation
    setTimeout(() => {
      showAlert('success', 'PDF erfolgreich generiert');
    }, 1000);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
      deleteInvoice(id);
      loadInvoices();
      showAlert('success', 'Rechnung erfolgreich gelöscht');
    }
  };

  const handleSaveInvoice = (invoice: Omit<Invoice, 'id'> | Invoice) => {
    try {
      if ('id' in invoice) {
        updateInvoice(invoice as Invoice);
        showAlert('success', 'Rechnung erfolgreich aktualisiert');
      } else {
        saveInvoice(invoice);
        showAlert('success', 'Rechnung erfolgreich hinzugefügt');
      }
      loadInvoices();
      setFormOpen(false);
    } catch (error) {
      showAlert('error', 'Fehler beim Speichern der Rechnung');
      console.error(error);
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
        title="Rechnungen" 
        subtitle="Verwalten Sie Ihre Rechnungen"
        action={{
          label: "Rechnung erstellen",
          onClick: handleAddInvoice
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
        <TextField
          fullWidth
          placeholder="Rechnungen suchen..."
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
      </Box>
      
      {filteredInvoices.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Keine Rechnungen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {invoices.length === 0 
              ? 'Erstellen Sie Ihre erste Rechnung, um zu beginnen' 
              : 'Versuchen Sie, Ihre Suchkriterien zu ändern'}
          </Typography>
          {invoices.length === 0 && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddInvoice}
            >
              Rechnung erstellen
            </Button>
          )}
        </Box>
      ) : (
        <InvoiceList
          invoices={filteredInvoices}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onView={handleViewInvoice}
          onGeneratePdf={handleGeneratePdf}
        />
      )}
      
      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveInvoice}
        invoice={currentInvoice}
        partners={partners}
        title={currentInvoice ? "Rechnung bearbeiten" : "Neue Rechnung erstellen"}
      />

      {currentInvoice && (
        <InvoicePreview
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          invoice={currentInvoice}
        />
      )}
    </>
  );
};

export default Invoices;
