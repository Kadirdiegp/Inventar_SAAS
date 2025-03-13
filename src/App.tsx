import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Partners from './pages/Partners';
import Invoices from './pages/Invoices';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
