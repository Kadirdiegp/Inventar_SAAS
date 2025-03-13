import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import { Invoice, Partner } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoicePreviewProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  partner?: Partner;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  open,
  onClose,
  invoice,
  partner
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Rechnung_${invoice.id.substring(0, 8).toUpperCase()}.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Rechnungsvorschau
      </DialogTitle>
      <DialogContent>
        <Box ref={invoiceRef} sx={{ p: 2, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#6200ea', fontWeight: 'bold' }}>
                RECHNUNG
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Rechnungsnummer: #{invoice.id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography variant="body2">
                Datum: {formatDate(invoice.date)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">Ihr Unternehmen GmbH</Typography>
              <Typography variant="body2">Musterstraße 123</Typography>
              <Typography variant="body2">12345 Musterstadt</Typography>
              <Typography variant="body2">info@ihrunternehmen.de</Typography>
              <Typography variant="body2">+49 123 456789</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Rechnungsempfänger:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {invoice.partnerName}
              </Typography>
              {partner && (
                <>
                  <Typography variant="body2">{partner.contact}</Typography>
                  <Typography variant="body2">{partner.address}</Typography>
                  <Typography variant="body2">{partner.email}</Typography>
                  <Typography variant="body2">{partner.phone}</Typography>
                </>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Zahlungsinformationen:
              </Typography>
              <Typography variant="body2">Bank: Musterbank</Typography>
              <Typography variant="body2">IBAN: DE12 3456 7890 1234 5678 90</Typography>
              <Typography variant="body2">BIC: MUSTBIC123</Typography>
              <Typography variant="body2">
                Zahlungsziel: 14 Tage nach Rechnungserhalt
              </Typography>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mt: 4, mb: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Produkt</TableCell>
                  <TableCell align="right">Preis</TableCell>
                  <TableCell align="right">Menge</TableCell>
                  <TableCell align="right">Gesamt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
              <Typography variant="body1">Zwischensumme:</Typography>
              <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', mb: 1 }}>
              <Typography variant="body1">MwSt (19%):</Typography>
              <Typography variant="body1">{formatCurrency(invoice.tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6">Gesamtsumme:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6200ea' }}>
                {formatCurrency(invoice.total)}
              </Typography>
            </Box>
          </Box>

          {invoice.notes && (
            <Box sx={{ mt: 2, mb: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Notizen:
              </Typography>
              <Typography variant="body2">{invoice.notes}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
            Vielen Dank für Ihr Vertrauen und Ihre Geschäftsbeziehung!
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Schließen
        </Button>
        <Button 
          onClick={generatePDF} 
          variant="contained" 
          color="primary"
          sx={{ 
            backgroundColor: '#6200ea',
            '&:hover': {
              backgroundColor: '#3700b3',
            }
          }}
        >
          Als PDF speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreview;
