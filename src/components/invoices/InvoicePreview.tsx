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
import { jsPDF } from 'jspdf';

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

  const generatePDF = () => {
    try {
      // A4 Format: 210x297mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Setze Schriftart und -größe
      pdf.setFontSize(12);
      
      // Füge Firmenlogo/Header hinzu
      pdf.setFontSize(20);
      pdf.setTextColor(98, 0, 234); // #6200ea
      pdf.text('RECHNUNG', 20, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Rechnungsnummer: #${invoice.id.substring(0, 8).toUpperCase()}`, 20, 30);
      pdf.text(`Datum: ${formatDate(invoice.date)}`, 20, 35);
      
      // Unternehmensinfo
      pdf.setFontSize(12);
      pdf.text('Ihr Unternehmen GmbH', 140, 20);
      pdf.setFontSize(10);
      pdf.text('Musterstraße 123', 140, 25);
      pdf.text('12345 Musterstadt', 140, 30);
      pdf.text('info@ihrunternehmen.de', 140, 35);
      pdf.text('+49 123 456789', 140, 40);
      
      // Trennlinie
      pdf.line(20, 45, 190, 45);
      
      // Kundeninfo
      pdf.setFontSize(11);
      pdf.text('Rechnungsempfänger:', 20, 55);
      pdf.setFontSize(10);
      pdf.text(invoice.partnerName, 20, 60);
      if (partner) {
        pdf.text(partner.contact || '', 20, 65);
        pdf.text(partner.address || '', 20, 70);
        pdf.text(partner.email || '', 20, 75);
        pdf.text(partner.phone || '', 20, 80);
      }
      
      // Zahlungsinfos
      pdf.setFontSize(11);
      pdf.text('Zahlungsinformationen:', 120, 55);
      pdf.setFontSize(10);
      pdf.text('Bank: Musterbank', 120, 60);
      pdf.text('IBAN: DE12 3456 7890 1234 5678 90', 120, 65);
      pdf.text('BIC: MUSTBIC123', 120, 70);
      pdf.text('Zahlungsziel: 14 Tage nach Rechnungserhalt', 120, 75);
      
      // Tabellenkopf für Produkte
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, 90, 170, 8, 'F');
      pdf.setFontSize(10);
      pdf.text('Produkt', 25, 95);
      pdf.text('Preis', 100, 95);
      pdf.text('Menge', 130, 95);
      pdf.text('Gesamt', 160, 95);
      
      // Tabelleninhalt
      let yPos = 105;
      invoice.items.forEach((item, index) => {
        pdf.text(item.productName, 25, yPos);
        pdf.text(formatCurrency(item.unitPrice), 100, yPos);
        pdf.text(item.quantity.toString(), 130, yPos);
        pdf.text(formatCurrency(item.total), 160, yPos);
        yPos += 8;
        
        // Neue Seite, wenn nötig
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      });
      
      // Zusammenfassung
      yPos += 10;
      pdf.text('Zwischensumme:', 130, yPos);
      pdf.text(formatCurrency(invoice.subtotal), 160, yPos);
      
      yPos += 6;
      pdf.text('MwSt (19%):', 130, yPos);
      pdf.text(formatCurrency(invoice.tax), 160, yPos);
      
      yPos += 8;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(120, yPos-5, 70, 8, 'F');
      pdf.setFontSize(11);
      pdf.text('Gesamtsumme:', 130, yPos);
      pdf.setTextColor(98, 0, 234); // #6200ea
      pdf.text(formatCurrency(invoice.total), 160, yPos);
      
      // Notizen
      if (invoice.notes) {
        yPos += 15;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.text('Notizen:', 20, yPos);
        pdf.setFontSize(10);
        yPos += 6;
        pdf.text(invoice.notes, 20, yPos);
      }
      
      // Fußzeile
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Vielen Dank für Ihr Vertrauen und Ihre Geschäftsbeziehung!', 65, 280);
      
      // PDF speichern
      pdf.save(`Rechnung_${invoice.id.substring(0, 8).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("Fehler bei der PDF-Generierung:", error);
      alert("Bei der PDF-Erstellung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    }
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
