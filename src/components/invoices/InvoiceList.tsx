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
  Chip,
  Tooltip,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onView: (invoice: Invoice) => void;
  onGeneratePdf: (invoice: Invoice) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return { color: 'default', label: 'Entwurf' };
    case 'sent':
      return { color: 'primary', label: 'Gesendet' };
    case 'paid':
      return { color: 'success', label: 'Bezahlt' };
    default:
      return { color: 'default', label: status };
  }
};

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onEdit,
  onDelete,
  onView,
  onGeneratePdf
}) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3, overflow: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>Rechnungsnr.</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Partner</TableCell>
            <TableCell align="right">Betrag</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Keine Rechnungen vorhanden
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const statusInfo = getStatusColor(invoice.status);
              return (
                <TableRow key={invoice.id} hover>
                  <TableCell component="th" scope="row">
                    #{invoice.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.partnerName}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={statusInfo.label} 
                      color={statusInfo.color as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Ansehen">
                        <IconButton 
                          size="small" 
                          onClick={() => onView(invoice)}
                          sx={{ color: '#6200ea' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bearbeiten">
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(invoice)}
                          sx={{ color: '#6200ea' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Als PDF">
                        <IconButton 
                          size="small" 
                          onClick={() => onGeneratePdf(invoice)}
                          sx={{ color: '#6200ea' }}
                        >
                          <PdfIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton 
                          size="small" 
                          onClick={() => onDelete(invoice.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoiceList;
