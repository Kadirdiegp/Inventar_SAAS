import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { Partner } from '../../types';

interface PartnerFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (partner: Omit<Partner, 'id'> | Partner) => void;
  partner?: Partner;
  title: string;
}

const initialPartner: Omit<Partner, 'id'> = {
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  notes: ''
};

const PartnerForm: React.FC<PartnerFormProps> = ({ open, onClose, onSave, partner, title }) => {
  const [formData, setFormData] = useState<Omit<Partner, 'id'> | Partner>(initialPartner);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (partner) {
      setFormData(partner);
    } else {
      setFormData(initialPartner);
    }
  }, [partner, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Partnername"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ansprechpartner"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="E-Mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notizen"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          sx={{ 
            backgroundColor: '#6200ea',
            '&:hover': {
              backgroundColor: '#3700b3',
            }
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerForm;
