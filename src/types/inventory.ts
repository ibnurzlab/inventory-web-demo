export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  date: string;
  partner: string; // Supplier for IN, Tujuan / Divisi / Customer for OUT
  notes?: string;
  createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}
