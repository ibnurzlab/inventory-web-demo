import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Item, Transaction, AppNotification, NotificationType } from '../types/inventory';
import {
  loadStoredItems,
  saveStoredItems,
  loadStoredTransactions,
  saveStoredTransactions,
  resetWarehouseData,
} from '../utils/storage';

interface InventoryContextType {
  items: Item[];
  transactions: Transaction[];
  lowStockItems: Item[];
  totalItemsCount: number;
  totalStockCount: number;
  recentTransactions: Transaction[];
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  notify: (type: NotificationType, title: string, message: string) => void;
  addItem: (data: {
    code: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
    minStock: number;
  }) => { success: boolean; message: string };
  updateItem: (
    id: string,
    data: {
      code: string;
      name: string;
      category: string;
      unit: string;
      stock: number;
      minStock: number;
    }
  ) => { success: boolean; message: string };
  deleteItem: (id: string) => { success: boolean; message: string };
  recordStockIn: (data: {
    itemId: string;
    quantity: number;
    date: string;
    partner: string;
    notes?: string;
  }) => { success: boolean; message: string };
  recordStockOut: (data: {
    itemId: string;
    quantity: number;
    date: string;
    partner: string;
    notes?: string;
  }) => { success: boolean; message: string };
  resetAllData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(() => loadStoredItems());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Auto-save whenever state changes
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  const notify = (type: NotificationType, title: string, message: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const lowStockItems = useMemo(() => {
    return items.filter((item) => Number(item.stock) <= Number(item.minStock));
  }, [items]);

  const totalItemsCount = items.length;

  const totalStockCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  }, [items]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const addItem = (data: {
    code: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
    minStock: number;
  }) => {
    const trimmedCode = data.code.trim().toUpperCase();
    const trimmedName = data.name.trim();

    if (!trimmedCode || !trimmedName) {
      notify('error', 'Validasi Gagal', 'Kode barang dan nama barang wajib diisi!');
      return { success: false, message: 'Kode dan nama barang wajib diisi' };
    }

    const codeExists = items.some((i) => i.code.toUpperCase() === trimmedCode);
    if (codeExists) {
      notify('error', 'Kode Duplikat', `Kode barang "${trimmedCode}" sudah terdaftar! Gunakan kode lain.`);
      return { success: false, message: 'Kode barang sudah digunakan' };
    }

    if (data.stock < 0 || data.minStock < 0) {
      notify('error', 'Nilai Tidak Valid', 'Stok awal dan stok minimum tidak boleh bernilai negatif!');
      return { success: false, message: 'Nilai stok tidak boleh negatif' };
    }

    const now = new Date().toISOString();
    const newItem: Item = {
      id: `item-${Date.now()}`,
      code: trimmedCode,
      name: trimmedName,
      category: data.category.trim() || 'Umum',
      unit: data.unit.trim() || 'Pcs',
      stock: Number(data.stock),
      minStock: Number(data.minStock),
      createdAt: now,
      updatedAt: now,
    };

    setItems((prev) => [newItem, ...prev]);
    notify('success', 'Barang Ditambahkan', `Barang "${newItem.name}" (${newItem.code}) berhasil disimpan.`);
    return { success: true, message: 'Barang berhasil disimpan' };
  };

  const updateItem = (
    id: string,
    data: {
      code: string;
      name: string;
      category: string;
      unit: string;
      stock: number;
      minStock: number;
    }
  ) => {
    const trimmedCode = data.code.trim().toUpperCase();
    const trimmedName = data.name.trim();

    if (!trimmedCode || !trimmedName) {
      notify('error', 'Validasi Gagal', 'Kode barang dan nama barang tidak boleh kosong.');
      return { success: false, message: 'Kode dan nama barang tidak boleh kosong' };
    }

    // Check duplicate code on other items
    const codeConflict = items.some((i) => i.id !== id && i.code.toUpperCase() === trimmedCode);
    if (codeConflict) {
      notify('error', 'Kode Duplikat', `Kode barang "${trimmedCode}" sudah digunakan oleh barang lain.`);
      return { success: false, message: 'Kode barang sudah digunakan oleh barang lain' };
    }

    if (data.stock < 0 || data.minStock < 0) {
      notify('error', 'Nilai Tidak Valid', 'Stok dan stok minimum tidak boleh bernilai negatif.');
      return { success: false, message: 'Nilai stok tidak boleh negatif' };
    }

    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              code: trimmedCode,
              name: trimmedName,
              category: data.category.trim() || 'Umum',
              unit: data.unit.trim() || 'Pcs',
              stock: Number(data.stock),
              minStock: Number(data.minStock),
              updatedAt: now,
            }
          : item
      )
    );

    notify('success', 'Barang Diperbarui', `Data barang "${trimmedName}" berhasil diperbarui.`);
    return { success: true, message: 'Data barang berhasil diperbarui' };
  };

  const deleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) {
      return { success: false, message: 'Barang tidak ditemukan' };
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    notify('info', 'Barang Dihapus', `Barang "${target.name}" (${target.code}) telah dihapus dari inventaris.`);
    return { success: true, message: 'Barang berhasil dihapus' };
  };

  const recordStockIn = (data: {
    itemId: string;
    quantity: number;
    date: string;
    partner: string;
    notes?: string;
  }) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) {
      notify('error', 'Barang Tidak Ditemukan', 'Silakan pilih barang yang valid.');
      return { success: false, message: 'Barang tidak ditemukan' };
    }

    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      notify('error', 'Jumlah Tidak Valid', 'Jumlah barang masuk harus lebih besar dari 0!');
      return { success: false, message: 'Jumlah barang masuk harus lebih dari 0' };
    }

    const trimmedPartner = data.partner.trim();
    if (!trimmedPartner) {
      notify('error', 'Data Belum Lengkap', 'Nama Supplier / Pemasok wajib diisi!');
      return { success: false, message: 'Nama supplier wajib diisi' };
    }

    const now = new Date().toISOString();
    const newStock = Number(item.stock) + qty;

    // Update item stock
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock: newStock, updatedAt: now } : i))
    );

    // Create transaction record
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      type: 'IN',
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit,
      quantity: qty,
      date: data.date || now.slice(0, 10),
      partner: trimmedPartner,
      notes: data.notes?.trim() || '',
      createdAt: now,
    };

    setTransactions((prev) => [newTrx, ...prev]);
    notify(
      'success',
      'Stok Masuk Berhasil',
      `Berhasil menambahkan +${qty} ${item.unit} "${item.name}". Total stok sekarang: ${newStock} ${item.unit}.`
    );

    return { success: true, message: 'Barang masuk berhasil dicatat' };
  };

  const recordStockOut = (data: {
    itemId: string;
    quantity: number;
    date: string;
    partner: string;
    notes?: string;
  }) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) {
      notify('error', 'Barang Tidak Ditemukan', 'Silakan pilih barang yang valid.');
      return { success: false, message: 'Barang tidak ditemukan' };
    }

    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      notify('error', 'Jumlah Tidak Valid', 'Jumlah barang keluar harus lebih besar dari 0!');
      return { success: false, message: 'Jumlah barang keluar harus lebih dari 0' };
    }

    // Critical validation: Reject if stock is insufficient
    if (qty > Number(item.stock)) {
      notify(
        'error',
        'Stok Tidak Mencukupi!',
        `Gagal mencatat barang keluar. Stok tersedia hanya ${item.stock} ${item.unit}, tetapi diminta ${qty} ${item.unit}.`
      );
      return {
        success: false,
        message: `Stok tidak mencukupi (Tersedia: ${item.stock} ${item.unit})`,
      };
    }

    const trimmedPartner = data.partner.trim();
    if (!trimmedPartner) {
      notify('error', 'Data Belum Lengkap', 'Tujuan / Divisi / Penerima barang keluar wajib diisi!');
      return { success: false, message: 'Tujuan penerima wajib diisi' };
    }

    const now = new Date().toISOString();
    const newStock = Number(item.stock) - qty;

    // Update item stock
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock: newStock, updatedAt: now } : i))
    );

    // Create transaction record
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      type: 'OUT',
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit,
      quantity: qty,
      date: data.date || now.slice(0, 10),
      partner: trimmedPartner,
      notes: data.notes?.trim() || '',
      createdAt: now,
    };

    setTransactions((prev) => [newTrx, ...prev]);

    notify(
      'success',
      'Stok Keluar Berhasil',
      `Berhasil mengeluarkan -${qty} ${item.unit} "${item.name}". Sisa stok: ${newStock} ${item.unit}.`
    );

    // Proactive warning if stock reaches or drops below minimum
    if (newStock <= Number(item.minStock)) {
      setTimeout(() => {
        notify(
          'warning',
          'Peringatan Stok Menipis',
          `Perhatian: Stok "${item.name}" kini ${newStock} ${item.unit} (Batas minimum: ${item.minStock} ${item.unit}). Segera lakukan restock!`
        );
      }, 400);
    }

    return { success: true, message: 'Barang keluar berhasil dicatat' };
  };

  const resetAllData = () => {
    const res = resetWarehouseData();
    setItems(res.items);
    setTransactions(res.transactions);
    notify('info', 'Data Direset', 'Semua data telah dikembalikan ke data sampel awal.');
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        transactions,
        lowStockItems,
        totalItemsCount,
        totalStockCount,
        recentTransactions,
        notifications,
        dismissNotification,
        notify,
        addItem,
        updateItem,
        deleteItem,
        recordStockIn,
        recordStockOut,
        resetAllData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
