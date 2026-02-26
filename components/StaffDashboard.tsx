
import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { Reservation, ReservationStatus, TableConfig, BookingType, Section } from '../types';

interface StaffDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onAddWalkIn: (name: string, phone: string, partySize: number, section: Section) => void;
  tableConfig: TableConfig;
  onUpdateConfig: (config: TableConfig) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ reservations, onUpdateStatus, onAddWalkIn, tableConfig, onUpdateConfig }) => {
  const [tab, setTab] = useState<'live' | 'setup'>('live');
  const [setupSection, setSetupSection] = useState<Section>(Section.INDOOR);
  const [filter, setFilter] = useState<'WAITING' | 'SEATED'>('WAITING');
  const [showWalkInForm, setShowWalkInForm] = useState(false);

  // Form state
  const [wiName, setWiName] = useState('');
  const [wiPhone, setWiPhone] = useState('');
  const [wiPartySize, setWiPartySize] = useState(2);
  const [wiSection, setWiSection] = useState<Section>(Section.INDOOR);

  const getSortKey = (res: Reservation) => {
    const date = res.scheduledDate || new Date(res.timestamp).toISOString().split('T')[0];
    const time = res.scheduledTime || new Date(res.timestamp).toTimeString().substring(0, 5);
    return `${date}T${time}`;
  };

  const waitingBookings = reservations.filter(r =>
    r.status === ReservationStatus.WAITING || r.status === ReservationStatus.READY
  ).sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const seatedBookings = reservations.filter(r => r.status === ReservationStatus.SEATED);

  // Capacity Logic
  const totalTables =
    (tableConfig.indoor.twoSeaters + tableConfig.indoor.fourSeaters + tableConfig.indoor.sixSeaters + tableConfig.indoor.eightSeaters) +
    (tableConfig.outdoor.twoSeaters + tableConfig.outdoor.fourSeaters + tableConfig.outdoor.sixSeaters + tableConfig.outdoor.eightSeaters);
  const occupiedTables = seatedBookings.length;
  const occupancyPercent = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wiName || !wiPhone) return;
    onAddWalkIn(wiName, wiPhone, wiPartySize, wiSection);
    setWiName('');
    setWiPhone('');
    setWiPartySize(2);
    setWiSection(Section.INDOOR);
    setShowWalkInForm(false);
  };

  const handleAlert = (res: Reservation) => {
    onUpdateStatus(res.id, ReservationStatus.READY);
    const message = `Ahlan ${res.name}! Your table for ${res.partySize} at Em Sherif Café Beirut is now ready. Please head to the host stand. We look forward to seeing you!`;
    const waLink = `https://wa.me/${res.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button onClick={() => setTab('live')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${tab === 'live' ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Reservations</button>
        <button onClick={() => setTab('setup')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${tab === 'setup' ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Restaurant Setup</button>
      </div>

      {tab === 'live' ? (
        <div className="space-y-6">
          {/* Capacity Visualization Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Live Occupancy</p>
                <h4 className="text-2xl font-serif text-emsherif-navy">{occupancyPercent}% <span className="text-sm font-sans font-normal text-gray-400">Full</span></h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-gray-300">Tables in Use</p>
                <p className="text-sm font-bold text-emsherif-navy">{occupiedTables} / {totalTables}</p>
              </div>
            </div>

            <div className="relative h-3 w-full bg-[#10b981] rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute top-0 left-0 h-full bg-[#ef4444] transition-all duration-1000 ease-out"
                style={{ width: `${occupancyPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Quick Walk-in Toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowWalkInForm(!showWalkInForm)}
              className="w-full flex items-center justify-between p-4 bg-emsherif-navy text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest"
            >
              <span>+ New Walk-in Guest</span>
              <span>{showWalkInForm ? '−' : '+'}</span>
            </button>
            {showWalkInForm && (
              <form onSubmit={handleWalkInSubmit} className="p-5 space-y-4 animate-in slide-in-from-top duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Guest Name</label>
                    <input
                      required
                      placeholder="e.g. Adel"
                      value={wiName}
                      onChange={e => setWiName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-emsherif-navy font-semibold outline-none focus:border-emsherif-navy transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Phone</label>
                    <div className="w-full px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-emsherif-navy font-semibold outline-none focus-within:border-emsherif-navy transition-all">
                      <PhoneInput
                        international
                        defaultCountry="LB"
                        value={wiPhone}
                        onChange={(val) => setWiPhone(val || '')}
                        className="phone-input-custom-staff"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Area</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setWiSection(Section.INDOOR)} className={`flex-1 py-2 text-[8px] font-bold uppercase rounded-lg transition-all ${wiSection === Section.INDOOR ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Indoor</button>
                    <button type="button" onClick={() => setWiSection(Section.OUTDOOR)} className={`flex-1 py-2 text-[8px] font-bold uppercase rounded-lg transition-all ${wiSection === Section.OUTDOOR ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Outdoor</button>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Party Size</label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200 h-[48px]">
                      <button type="button" onClick={() => setWiPartySize(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-emsherif-navy font-bold active:bg-gray-100 transition-colors">−</button>
                      <span className="text-sm font-bold text-emsherif-navy">{wiPartySize}</span>
                      <button type="button" onClick={() => setWiPartySize(p => p + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-emsherif-navy font-bold active:bg-gray-100 transition-colors">+</button>
                    </div>
                  </div>
                  <button type="submit" className="h-[48px] bg-[#D4AF37] text-white px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all">
                    Add Guest
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sub-tabs for Waiting/Seated */}
          <div className="flex gap-4 border-b border-gray-50 pb-2">
            <button
              onClick={() => setFilter('WAITING')}
              className={`text-[10px] font-bold uppercase tracking-widest pb-2 transition-all ${filter === 'WAITING' ? 'text-emsherif-navy border-b-2 border-emsherif-navy' : 'text-gray-300'}`}
            >
              Waiting ({waitingBookings.length})
            </button>
            <button
              onClick={() => setFilter('SEATED')}
              className={`text-[10px] font-bold uppercase tracking-widest pb-2 transition-all ${filter === 'SEATED' ? 'text-emsherif-navy border-b-2 border-emsherif-navy' : 'text-gray-300'}`}
            >
              Seated ({seatedBookings.length})
            </button>
          </div>

          <div className="space-y-4">
            {filter === 'WAITING' ? (
              <>
                {waitingBookings.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs text-gray-300 font-medium italic">No waiting guests</p>
                  </div>
                ) : (() => {
                  let lastDate = "";
                  return waitingBookings.map(res => {
                    const currentDate = res.scheduledDate || new Date(res.timestamp).toISOString().split('T')[0];
                    const isNewDate = currentDate !== lastDate;
                    lastDate = currentDate;

                    return (
                      <React.Fragment key={res.id}>
                        {isNewDate && (
                          <div className="pt-2 pb-1 border-b border-gray-50 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                              {formatDateLabel(currentDate)}
                            </span>
                          </div>
                        )}
                        <div className={`bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 ${res.status === ReservationStatus.READY ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-800">{res.name}</h4>
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${res.bookingType === BookingType.WALK_IN ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {res.bookingType === BookingType.WALK_IN ? 'Walk-in' : 'Scheduled'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-medium">
                              {res.scheduledTime || 'Walk-in'} • {res.partySize} Guests • {res.section}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {res.status !== ReservationStatus.READY && (
                              <button
                                onClick={() => handleAlert(res)}
                                className="bg-white border border-emerald-500 text-emerald-500 px-3 py-2 rounded-lg text-[9px] font-bold uppercase hover:bg-emerald-50 transition-all"
                              >
                                Alert
                              </button>
                            )}
                            <button
                              onClick={() => onUpdateStatus(res.id, ReservationStatus.SEATED)}
                              className="bg-emsherif-navy text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase shadow-md active:scale-95 transition-all"
                            >
                              Seat
                            </button>
                            <button onClick={() => onUpdateStatus(res.id, ReservationStatus.CANCELLED)} className="text-gray-300 px-2 py-1 text-[10px] font-bold uppercase hover:text-red-400 transition-colors">X</button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </>
            ) : (
              <>
                {seatedBookings.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs text-gray-300 font-medium italic">No active tables</p>
                  </div>
                ) : (
                  seatedBookings.map(res => (
                    <div key={res.id} className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm flex justify-between items-center border-l-4 border-l-emerald-400">
                      <div>
                        <h4 className="font-bold text-gray-800">{res.name}</h4>
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Currently Seated • {res.partySize} Guests • {res.section}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateStatus(res.id, ReservationStatus.COMPLETED)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95 transition-all"
                        >
                          Clear Table
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-xl font-serif text-emsherif-navy mb-1">Physical Inventory</h3>
            <p className="text-xs text-gray-400">Define the number of tables available for booking per hour.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setSetupSection(Section.INDOOR)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${setupSection === Section.INDOOR ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Indoor</button>
            <button onClick={() => setSetupSection(Section.OUTDOOR)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${setupSection === Section.OUTDOOR ? 'bg-white shadow-sm text-emsherif-navy' : 'text-gray-400'}`}>Outdoor</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '2-Seater Tables', key: 'twoSeaters' },
              { label: '4-Seater Tables', key: 'fourSeaters' },
              { label: '6-Seater Tables', key: 'sixSeaters' },
              { label: '8-Seater Tables', key: 'eightSeaters' }
            ].map(item => (
              <div key={item.key} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:border-[#D4AF37] transition-all">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">{item.label}</label>
                <input
                  type="number"
                  value={setupSection === Section.INDOOR ? (tableConfig.indoor as any)[item.key] : (tableConfig.outdoor as any)[item.key]}
                  onChange={(e) => {
                    const newVal = parseInt(e.target.value) || 0;
                    if (setupSection === Section.INDOOR) {
                      onUpdateConfig({ ...tableConfig, indoor: { ...tableConfig.indoor, [item.key]: newVal } });
                    } else {
                      onUpdateConfig({ ...tableConfig, outdoor: { ...tableConfig.outdoor, [item.key]: newVal } });
                    }
                  }}
                  className="w-full text-2xl font-serif text-emsherif-navy outline-none bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
