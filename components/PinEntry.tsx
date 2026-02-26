
import React, { useState, useEffect } from 'react';

interface PinEntryProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PIN_REQUIRED = "2011";

const PinEntry: React.FC<PinEntryProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === PIN_REQUIRED) {
          onSuccess();
        } else {
          setTimeout(() => {
            setError(true);
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="absolute inset-0 bg-white z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12 space-y-4 w-full">
        <h3 className="text-2xl font-serif text-emsherif-navy">Staff Access</h3>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Enter Access PIN</p>
        
        {/* PIN Indicators */}
        <div className={`flex justify-center gap-6 mt-8 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > i 
                ? 'bg-emsherif-navy border-emsherif-navy' 
                : error ? 'border-red-400' : 'border-gray-200'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-2">Incorrect PIN</p>}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center text-xl font-medium text-emsherif-navy hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={onCancel}
          className="w-16 h-16 rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter text-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center text-xl font-medium text-emsherif-navy hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="w-16 h-16 rounded-full flex items-center justify-center text-gray-400 hover:text-emsherif-navy active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
};

export default PinEntry;
