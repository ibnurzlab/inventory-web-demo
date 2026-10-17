import { Item, Transaction } from '../types/inventory';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS } from './sampleData';

const ITEMS_KEY = 'gudangflow_items_v1';
const TRANSACTIONS_KEY = 'gudangflow_transactions_v1';

export const loadStoredItems = (): Item[] => {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      saveStoredItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ITEMS;
  } catch (err) {
    console.error('Failed to load items from storage:', err);
    return INITIAL_ITEMS;
  }
};

export const saveStoredItems = (items: Item[]): void => {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to storage:', err);
  }
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('Failed to load transactions from storage:', err);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to storage:', err);
  }
};

export const resetWarehouseData = (): { items: Item[]; transactions: Transaction[] } => {
  saveStoredItems(INITIAL_ITEMS);
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  return { items: INITIAL_ITEMS, transactions: INITIAL_TRANSACTIONS };
};

export const formatDateID = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateTimeID = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  const headers = ['ID Transaksi', 'Jenis', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Satuan', 'Tanggal', 'Pemasok / Tujuan', 'Catatan'];
  const rows = transactions.map((t) => [
    t.id,
    t.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar',
    `"${t.itemCode}"`,
    `"${t.itemName.replace(/"/g, '""')}"`,
    t.quantity,
    t.unit,
    t.date,
    `"${t.partner.replace(/"/g, '""')}"`,
    `"${(t.notes || '-').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `riwayat-inventory-gudang-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
