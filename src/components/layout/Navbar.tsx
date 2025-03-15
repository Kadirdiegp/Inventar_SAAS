import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Inventory as InventoryIcon, 
  Receipt as ReceiptIcon, 
  People as PeopleIcon, 
  Dashboard as DashboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/2.png';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventar', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Rechnungen', icon: <ReceiptIcon />, path: '/invoices' },
    { text: 'Partner', icon: <PeopleIcon />, path: '/partners' },
  ];

  const toggleDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#000000', boxShadow: 'none' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Box 
                component={Link} 
                to="/"
                sx={{ 
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <img src={logo} alt="Logo" style={{ height: '50px' }} />
              </Box>
            </>
          ) : (
            <>
              <Box 
                component={Link} 
                to="/"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <img src={logo} alt="Logo" style={{ height: '50px' }} />
              </Box>
              <Box sx={{ display: 'flex' }}>
                {menuItems.map((item) => (
                  <Button 
                    key={item.text}
                    component={Link} 
                    to={item.path}
                    color="inherit"
                    sx={{ 
                      mx: 1,
                      fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      borderBottom: isActive(item.path) ? '2px solid white' : 'none',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Seitliches Drawer-Menü für Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            <Typography variant="h6">Menü</Typography>
            <IconButton color="inherit" onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ backgroundColor: 'black', height: '100vh' }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    backgroundColor: isActive(item.path)
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
