import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { TSO } from './pages/TSO';
import { Sales } from './pages/Sales';
import { Inventory } from './pages/Inventory';
import { Fiscal } from './pages/Fiscal';
import { Reports } from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/tso" element={<TSO />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/fiscal" element={<Fiscal />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
