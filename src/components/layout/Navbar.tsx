import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, PlusCircle, ArrowDownToDot, ArrowUpFromDot } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return { title: 'Dashboard Gudang', crumb: 'Ringkasan Aktivitas' };
      case '/barang':
        return { title: 'Data Master Barang', crumb: 'Katalog & Stok' };
      case '/barang-masuk':
        return { title: 'Pencatatan Barang Masuk', crumb: 'Inbound Warehouse' };
      case '/barang-keluar':
        return { title: 'Pencatatan Barang Keluar', crumb: 'Outbound Warehouse' };
      case '/riwayat':
        return { title: 'Riwayat Transaksi', crumb: 'Audit Log & Laporan' };
      default:
        return { title: 'GudangFlow', crumb: 'Manajemen Inventory' };
    }
  };

  const current = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">
            {current.title}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-slate-500 font-medium">
            {current.crumb}
          </span>
        </div>
      </div>

      {/* Zone 3: Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          to="/barang-masuk"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <ArrowDownToDot className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Catat</span> Masuk
        </Link>
        <Link
          to="/barang-keluar"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <ArrowUpFromDot className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Catat</span> Keluar
        </Link>
        <Link
          to="/barang?action=new"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Barang
        </Link>
      </div>
    </header>
  );
};
