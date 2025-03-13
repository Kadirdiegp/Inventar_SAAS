import React from 'react';
import { Typography, Box, Divider, Button } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant="contained"
            color="primary"
            onClick={action.onClick}
            startIcon={action.icon}
            sx={{ 
              backgroundColor: '#6200ea',
              '&:hover': {
                backgroundColor: '#3700b3',
              }
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
      <Divider />
    </Box>
  );
};

export default PageHeader;
