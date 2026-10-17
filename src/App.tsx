import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ItemsPage } from './pages/ItemsPage';
import { StockInPage } from './pages/StockInPage';
import { StockOutPage } from './pages/StockOutPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="barang" element={<ItemsPage />} />
            <Route path="barang-masuk" element={<StockInPage />} />
            <Route path="barang-keluar" element={<StockOutPage />} />
            <Route path="riwayat" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}
