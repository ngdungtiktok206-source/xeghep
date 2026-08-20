import React from 'react';
import { Route, Car, ShieldCheck, Settings, Sparkles, User, RefreshCw, Zap } from 'lucide-react';

export type AppTab = 'passenger' | 'driver' | 'admin' | 'account';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onResetDemo: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onResetDemo,
  isResetting = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('passenger')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Viastep</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Ghép xe liên tỉnh theo lộ tuyến thông minh</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onTabChange('passenger')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'passenger'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Hành khách</span>
            </button>

            <button
              onClick={() => onTabChange('driver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'driver'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Tài xế</span>
            </button>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Thuật toán & Quản trị</span>
              <span className="md:hidden">Admin</span>
            </button>

            <button
              onClick={() => onTabChange('account')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'account'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Tài khoản</span>
            </button>
          </nav>

          {/* Quick Actions & Demo Scenario Button */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
              title="Khôi phục dữ liệu mẫu: 12 tài xế và 20 yêu cầu khách dọc tuyến Hà Nội - Ninh Bình"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Load Demo Scenario</span>
              <span className="lg:hidden">Demo</span>
            </button>

            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Corridor Engine: Sẵn sàng</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
