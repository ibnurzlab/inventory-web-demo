import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowDownToDot,
  ArrowUpFromDot,
  Boxes,
} from 'lucide-react';
import { Item } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { ItemModal } from '../components/items/ItemModal';

export const ItemsPage: React.FC = () => {
  const { items, deleteItem } = useInventory();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'SAFE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Check URL query param e.g. ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingItem(null);
      setModalOpen(true);
      // Clean query parameter after opening
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      // Category filter
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      // Stock status filter
      const isLow = Number(item.stock) <= Number(item.minStock);
      const matchesStock =
        stockStatusFilter === 'ALL' ||
        (stockStatusFilter === 'LOW' && isLow) ||
        (stockStatusFilter === 'SAFE' && !isLow);

      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [items, searchQuery, selectedCategory, stockStatusFilter]);

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus "${item.name}" (${item.code})?\nSemua data stok item ini akan dihapus.`
    );
    if (confirmed) {
      deleteItem(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Master Barang
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data katalog barang, satuan, stok aktual, serta batas minimum persediaan.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode, nama barang, atau kategori..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kategori ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setStockStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stockStatusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setStockStatusFilter('LOW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stockStatusFilter === 'LOW'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-800 hover:text-amber-900'
            }`}
          >
            Menipis
          </button>
          <button
            onClick={() => setStockStatusFilter('SAFE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stockStatusFilter === 'SAFE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-800 hover:text-emerald-900'
            }`}
          >
            Aman
          </button>
        </div>
      </div>

      {/* Main Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">
                Tidak ada data barang yang cocok
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan status stok.
              </p>
              {(searchQuery || selectedCategory !== 'ALL' || stockStatusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setStockStatusFilter('ALL');
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4 text-right">Stok Aktual</th>
                  <th className="py-3 px-4 text-right">Stok Min.</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Mutasi Cepat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isLow = Number(item.stock) <= Number(item.minStock);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Kode */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-900">
                        {item.code}
                      </td>

                      {/* Nama Barang */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.name}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {item.category}
                      </td>

                      {/* Satuan */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {item.unit}
                      </td>

                      {/* Stok Aktual */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                        <span
                          className={`text-sm ${
                            isLow ? 'text-amber-800' : 'text-slate-900'
                          }`}
                        >
                          {Number(item.stock).toLocaleString('id-ID')}
                        </span>
                      </td>

                      {/* Stok Minimum */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                        {Number(item.minStock).toLocaleString('id-ID')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-md">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Quick Mutasi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/barang-masuk?itemId=${item.id}`}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Catat Stok Masuk"
                          >
                            <ArrowDownToDot className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/barang-keluar?itemId=${item.id}`}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            title="Catat Stok Keluar"
                          >
                            <ArrowUpFromDot className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Ubah Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer info */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-semibold text-slate-800">{filteredItems.length}</span> dari{' '}
            <span className="font-semibold text-slate-800">{items.length}</span> total barang
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Stok Aman
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Stok Menipis (≤ Batas Min)
            </span>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemToEdit={editingItem}
      />
    </div>
  );
};
