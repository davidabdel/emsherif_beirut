
import React from 'react';
import { Reservation } from '../types';

interface UserStatusProps {
  reservation: Reservation;
  onCancel: () => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ reservation, onCancel }) => {
  const generateWhatsAppLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const cancelLink = `${baseUrl}?cancelId=${reservation.id}`;
    
    const message = `Confirmation for Em Sherif Café Cairo:
- Guest: ${reservation.name}
- Date: ${reservation.scheduledDate}
- Time: ${reservation.scheduledTime}
- Party Size: ${reservation.partySize} Guests
- Confirmation Code: ${reservation.id}

⚠️ NOTE: If you are more than 15 minutes late, your reservation will be automatically cancelled.

Need to cancel? Click here: ${cancelLink}`;

    const encodedMessage = encodeURIComponent(message);
    // Use the guest's phone if available, or just the message link
    return `https://wa.me/${reservation.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-50 overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-emsherif-navy p-8 text-center space-y-2">
          <div className="bg-green-500 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg shadow-green-900/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-white font-serif text-2xl">Confirmed</h3>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Digital Reservation Ticket</p>
        </div>

        {/* Ticket Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-8 border-b border-gray-100 pb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Guest</p>
              <p className="text-sm font-bold text-emsherif-navy">{reservation.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Party Size</p>
              <p className="text-sm font-bold text-emsherif-navy">{reservation.partySize} Guests</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Arrival Date</p>
                <p className="text-xl font-serif text-emsherif-navy">{reservation.scheduledDate}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time</p>
                <p className="text-xl font-bold text-emsherif-navy">{reservation.scheduledTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-center space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Confirmation Code</p>
            <p className="text-2xl font-mono font-bold tracking-tighter text-emsherif-navy">{reservation.id}</p>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative h-4 flex items-center">
          <div className="absolute -left-2 w-4 h-4 bg-[#FDFCFB] rounded-full border border-gray-50"></div>
          <div className="w-full border-t border-dashed border-gray-200"></div>
          <div className="absolute -right-2 w-4 h-4 bg-[#FDFCFB] rounded-full border border-gray-50"></div>
        </div>

        {/* Action Button: WhatsApp */}
        <div className="px-8 pb-4">
          <a 
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] py-4 rounded-2xl font-bold text-white shadow-lg shadow-green-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Send WhatsApp Confirmation
          </a>
        </div>

        {/* Footer Info */}
        <div className="p-8 pt-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#D4AF37] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase">
              15-Minute Policy: <span className="text-emsherif-navy font-normal normal-case">If you arrive more than 15 minutes past your scheduled time, the system will automatically release your table.</span>
            </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onCancel}
        className="w-full py-2 text-red-300 font-bold uppercase tracking-widest text-[9px] hover:text-red-500 transition-colors"
      >
        Cancel Reservation
      </button>
    </div>
  );
};

export default UserStatus;
