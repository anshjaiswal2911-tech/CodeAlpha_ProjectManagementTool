import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import {
  Bell,
  LogOut,
  User,
  CheckCircle2,
  Wifi,
  WifiOff,
  Menu,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-sm">
      {/* Left side: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              CodeAlpha <span className="text-brand-600">PM</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Right side: Realtime status, User profile dropdown */}
      <div className="flex items-center gap-4">
        {/* Real-time sync badge */}
        <div
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
            connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={connected ? 'Real-time WebSocket active' : 'Connecting to real-time server...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{connected ? 'Live Sync' : 'Reconnecting'}</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Avatar user={user} size="sm" />
            <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 focus:outline-none z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <p className="text-[11px] text-brand-600 mt-0.5 font-medium">{user?.jobTitle || 'Team Member'}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/my-tasks"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  My Assigned Tasks
                </Link>
                <Link
                  to="/team"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Team Directory
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
