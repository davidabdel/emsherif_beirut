
import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { Reservation, BookingType, TableConfig, Section } from '../types';

interface BookingFormProps {
  onSubmit: (res: Omit<Reservation, 'id' | 'status' | 'timestamp'>) => void;
  currentReservations: Reservation[];
  tableConfig: TableConfig;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, currentReservations, tableConfig }) => {
  const getTodayStr = () => {
    const d = new Date();
    // Use local date parts to avoid UTC offset issues causing "yesterday" to appear in some timezones
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayStr();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState<number>(2);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [section, setSection] = useState<Section>(Section.INDOOR);

  const availableTimes = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  // Explicitly validate date on change for mobile browsers that ignore 'min'
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate < today) {
      setDate(today);
    } else {
      setDate(selectedDate);
    }
  };

  const getTableSizeForParty = (size: number) => {
    if (size <= 2) return 2;
    if (size <= 4) return 4;
    if (size <= 6) return 6;
    if (size <= 8) return 8;
    return null;
  };

  const getSlotAvailability = (targetDate: string, targetTime: string, targetPartySize: number, targetSection: Section) => {
    const tableSizeNeeded = getTableSizeForParty(targetPartySize);
    if (!tableSizeNeeded) return { disabled: true, reason: 'Too Large' };

    const bookingsInSlot = currentReservations.filter(r =>
      r.scheduledDate === targetDate &&
      r.scheduledTime === targetTime &&
      r.section === targetSection &&
      r.status !== 'CANCELLED'
    );

    const countBookedOfSize = bookingsInSlot.filter(r => getTableSizeForParty(r.partySize) === tableSizeNeeded).length;

    const sectionConfig = targetSection === Section.INDOOR ? tableConfig.indoor : tableConfig.outdoor;
    let totalCapacity = 0;
    if (tableSizeNeeded === 2) totalCapacity = sectionConfig.twoSeaters;
    if (tableSizeNeeded === 4) totalCapacity = sectionConfig.fourSeaters;
    if (tableSizeNeeded === 6) totalCapacity = sectionConfig.sixSeaters;
    if (tableSizeNeeded === 8) totalCapacity = sectionConfig.eightSeaters;

    return {
      disabled: countBookedOfSize >= totalCapacity,
      reason: countBookedOfSize >= totalCapacity ? 'Full' : null
    };
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return alert("Please select a time slot.");

    // Final safety check before submission
    if (date < today) {
      alert("Please select a valid date.");
      setDate(today);
      return;
    }

    const { disabled } = getSlotAvailability(date, time, partySize, section);
    if (disabled) return alert("This table size is fully booked for this slot in the selected section.");

    onSubmit({ name, phone, partySize, section, bookingType: BookingType.SCHEDULED, scheduledDate: date, scheduledTime: time });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      <div className="space-y-6">
        {/* Date Selection with enhanced visibility */}
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
            Preferred Date
          </label>
          <div className="relative">
            <input
              required
              type="date"
              value={date}
              min={today}
              onChange={handleDateChange}
              className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:border-emsherif-navy transition-all text-emsherif-navy font-bold text-lg min-h-[64px]"
              style={{ colorScheme: 'light' }}
            />
            {/* Subtle calendar icon overlay to indicate interactivity */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-400 font-medium">
            Selected: <span className="text-emsherif-navy">{formatDateDisplay(date)}</span>
          </p>
        </div>

        {/* Guest Selection */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-3">Guests</label>
          <div className="relative">
            <input
              required
              type="number"
              readOnly
              value={partySize}
              className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none text-2xl font-serif text-emsherif-navy"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
              <button
                type="button"
                onClick={() => setPartySize(p => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 bg-white shadow-sm active:scale-90 transition-all"
              >
                <span className="text-xl">−</span>
              </button>
              <button
                type="button"
                onClick={() => setPartySize(p => Math.min(8, p + 1))}
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 bg-white shadow-sm active:scale-90 transition-all"
              >
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>
          {partySize > 8 && <p className="text-[10px] text-red-400 mt-2 uppercase font-bold">For parties &gt; 8, please call us directly.</p>}
        </div>

        {/* Section Selection */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-3">Seating Area</label>
          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setSection(Section.INDOOR)}
              className={`flex-1 py-4 text-xs font-bold uppercase rounded-xl transition-all ${section === Section.INDOOR ? 'bg-white shadow-sm text-emsherif-navy border border-gray-100' : 'text-gray-400'}`}
            >
              Indoor
            </button>
            <button
              type="button"
              onClick={() => setSection(Section.OUTDOOR)}
              className={`flex-1 py-4 text-xs font-bold uppercase rounded-xl transition-all ${section === Section.OUTDOOR ? 'bg-white shadow-sm text-emsherif-navy border border-gray-100' : 'text-gray-400'}`}
            >
              Outdoor
            </button>
          </div>
        </div>

        {/* Slots Picker */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-3">Available Slots</label>
          <div className="grid grid-cols-3 gap-3">
            {availableTimes.map(t => {
              const { disabled, reason } = getSlotAvailability(date, t, partySize, section);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => setTime(t)}
                  className={`py-4 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1 ${disabled ? 'bg-gray-50 text-gray-200 border-transparent opacity-50 cursor-not-allowed' :
                    time === t ? 'bg-emsherif-navy text-[#D4AF37] border-emsherif-navy shadow-lg scale-[1.02]' : 'bg-white text-gray-600 border-gray-100 hover:border-[#D4AF37]'
                    }`}
                >
                  <span>{t}</span>
                  {reason && <span className="text-[8px] uppercase tracking-tighter">{reason}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div className="pt-4 space-y-4 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Full Name</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-emsherif-navy font-medium text-gray-700" placeholder="e.g. Adel Salamah" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Mobile Number</label>
            <div className="w-full px-5 py-2 bg-white border border-gray-100 rounded-2xl outline-none focus-within:border-emsherif-navy font-medium text-gray-700">
              <PhoneInput
                international
                defaultCountry="LB"
                value={phone}
                onChange={(val) => setPhone(val || '')}
                placeholder="Mobile number"
                className="phone-input-custom"
              />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-emsherif-navy py-5 rounded-2xl font-bold text-[#D4AF37] shadow-xl uppercase tracking-[0.2em] text-sm active:scale-[0.98] transition-all">
        Confirm Reservation
      </button>
    </form>
  );
};

export default BookingForm;
