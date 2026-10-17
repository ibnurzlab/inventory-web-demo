import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToDot,
  ArrowUpFromDot,
  History,
  RotateCcw,
  Warehouse,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { lowStockItems, totalItemsCount, resetAllData } = useInventory();

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/barang',
      label: 'Data Barang',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Menipis` : `${totalItemsCount}`,
      badgeCritical: lowStockItems.length > 0,
    },
    {
      to: '/barang-masuk',
      label: 'Barang Masuk',
      icon: ArrowDownToDot,
      badge: null,
    },
    {
      to: '/barang-keluar',
      label: 'Barang Keluar',
      icon: ArrowUpFromDot,
      badge: null,
    },
    {
      to: '/riwayat',
      label: 'Riwayat Transaksi',
      icon: History,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                GudangFlow
              </span>
              <span className="text-[11px] text-slate-400 block font-normal">
                Inventory Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Menu Utama
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium tabular-nums ${
                      link.badgeCritical
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Critical alert reminder in sidebar if any items are low on stock */}
        {lowStockItems.length > 0 && (
          <div className="px-3 pb-3">
            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Perlu Restock</span>
              </div>
              <p className="text-[12px] text-amber-200/80 leading-snug">
                Ada <span className="font-bold tabular-nums">{lowStockItems.length}</span> barang dengan stok menipis di gudang.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Utility / Quick Reset */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => {
              if (window.confirm('Reset seluruh data ke sampel awal? Perubahan data saat ini akan digantikan dengan data demo.')) {
                resetAllData();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Demo</span>
          </button>
        </div>
      </aside>
    </>
  );
};
