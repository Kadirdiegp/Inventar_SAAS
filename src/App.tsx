import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Partners from './pages/Partners';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Öffentliche Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Geschützte Routen */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/add" element={<Inventory />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/invoices" element={<Invoices />} />
            </Route>
          </Route>
          
          {/* Fallback für nicht gefundene Routen */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
