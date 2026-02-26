
import React from 'react';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  onViewToggle: () => void;
  currentView: 'customer' | 'staff';
}

const Header: React.FC<HeaderProps> = ({ onViewToggle, currentView }) => {
  const isStaff = currentView === 'staff';

  return (
    <header className="bg-white p-8 sticky top-0 z-50 shadow-sm flex flex-col items-center justify-center text-center relative transition-all duration-500">
      {/* Hidden toggle for Staff - placed top right */}
      <button
        onClick={onViewToggle}
        className="absolute top-0 right-0 w-20 h-20 opacity-0 cursor-default z-10"
        aria-label="Toggle Portal"
      />

      <div className="flex flex-col items-center w-full max-w-[260px]">
        {/* The Brand Logo Image - No longer inverting for staff view */}
        <div className="transition-all duration-500">
          <img
            src={LOGO_URL}
            alt="Em Sherif Café Logo"
            className="w-full h-auto object-contain select-none"
            style={{ maxHeight: '140px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Location line - always visible now */}
        <div className="mt-4 flex items-center justify-center gap-4 opacity-20">
          <div className="h-[1px] w-6 bg-emsherif-navy"></div>
          <p className="text-[8px] tracking-[0.4em] uppercase text-emsherif-navy font-bold">Beirut</p>
          <div className="h-[1px] w-6 bg-emsherif-navy"></div>
        </div>

        {isStaff && (
          <div className="mt-4">
            <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-emsherif-navy bg-gray-50 border border-emsherif-navy/10 px-5 py-2 rounded-full shadow-sm">
              Staff Portal
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
