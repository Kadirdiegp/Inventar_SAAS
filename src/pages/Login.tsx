import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Container
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/2.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    setError(null);

    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben');
      setIsLogging(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
      console.error('Login error:', err);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#000000'
    }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          width: '100%',
          backgroundColor: '#121212',
          color: 'white',
          border: '1px solid #333'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}>
          <img src={logo} alt="Logo" style={{ height: '80px', marginBottom: '16px' }} />
          <Typography variant="h4" gutterBottom align="center">
            Admin Login
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaa', mb: 3 }} align="center">
            Bitte loggen Sie sich ein, um auf das Inventarsystem zuzugreifen
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#350000', color: '#ff8a80' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="E-Mail"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#29b6f6',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              }
            }}
          />
          <TextField
            label="Passwort"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#29b6f6',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              }
            }}
          />
          <Button 
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            type="submit"
            disabled={isLogging}
            sx={{ 
              py: 1.5,
              mt: 1,
              backgroundColor: '#29b6f6',
              '&:hover': {
                backgroundColor: '#0086c3',
              }
            }}
          >
            {isLogging ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
