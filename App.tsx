
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, BookingType, TableConfig, Section } from './types';
import Header from './components/Header';
import BookingForm from './components/BookingForm';
import UserStatus from './components/UserStatus';
import StaffDashboard from './components/StaffDashboard';
import PinEntry from './components/PinEntry';

const STORAGE_KEY = 'emsherif_beirut_bookings_v2';
const CONFIG_KEY = 'emsherif_beirut_config_v2';
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

const DEFAULT_CONFIG: TableConfig = {
  indoor: {
    twoSeaters: 12,
    fourSeaters: 8,
    sixSeaters: 4,
    eightSeaters: 2
  },
  outdoor: {
    twoSeaters: 8,
    fourSeaters: 7,
    sixSeaters: 4,
    eightSeaters: 2
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tableConfig, setTableConfig] = useState<TableConfig>(DEFAULT_CONFIG);
  const [activeRes, setActiveRes] = useState<Reservation | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load Data
  useEffect(() => {
    // 1. Try to load from API (Hard Save)
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();

        if (data.reservations && data.reservations.length > 0) {
          const parsedRes = data.reservations.map((r: any) => ({
            ...r,
            section: r.section || Section.INDOOR,
            timestamp: new Date(r.timestamp)
          }));
          setReservations(parsedRes);
        } else {
          // Fallback to localStorage if API is empty
          const savedRes = localStorage.getItem(STORAGE_KEY);
          if (savedRes) {
            setReservations(JSON.parse(savedRes).map((r: any) => ({
              ...r,
              section: r.section || Section.INDOOR,
              timestamp: new Date(r.timestamp)
            })));
          }
        }

        if (data.tableConfig) {
          setTableConfig(data.tableConfig);
        } else {
          // Fallback to localStorage
          const savedConfig = localStorage.getItem(CONFIG_KEY);
          if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            if (parsed.indoor && parsed.outdoor) {
              setTableConfig(parsed);
            } else {
              setTableConfig({ indoor: parsed, outdoor: DEFAULT_CONFIG.outdoor });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch from hard storage, using active cache:', err);
        // Fallback already handled by initial state or logic above
      }
    };

    fetchData();

    // Check for cancellation deep link from WhatsApp
    const params = new URLSearchParams(window.location.search);
    const cancelId = params.get('cancelId');
    if (cancelId) {
      // We'll trust the current reservations state for this check
      const target = reservations.find((r: any) => r.id === cancelId && r.status === ReservationStatus.WAITING);
      if (target) {
        setActiveRes(target);
        setIsSuccess(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Save Data
  useEffect(() => {
    // 1. Update localStorage (Quick Cache)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    localStorage.setItem(CONFIG_KEY, JSON.stringify(tableConfig));

    // 2. Persist to API (Hard Save)
    if (reservations.length > 0 || JSON.stringify(tableConfig) !== JSON.stringify(DEFAULT_CONFIG)) {
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservations, tableConfig }),
      }).catch(err => console.error('Hard save failed:', err));
    }
  }, [reservations, tableConfig]);

  const handleBooking = async (resData: Omit<Reservation, 'id' | 'status' | 'timestamp'>) => {
    const newRes: Reservation = {
      ...resData,
      id: `RES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: ReservationStatus.WAITING,
      timestamp: new Date(),
    };

    // Trigger webhook
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRes),
    }).catch(err => console.error('Webhook trigger failed:', err));

    await new Promise(resolve => setTimeout(resolve, 800));
    setReservations(prev => [...prev, newRes]);
    setActiveRes(newRes);
    setIsSuccess(true);
  };

  const handleAddWalkIn = (name: string, phone: string, partySize: number, section: Section) => {
    const newRes: Reservation = {
      id: `WALK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name,
      phone,
      partySize,
      status: ReservationStatus.WAITING,
      bookingType: BookingType.WALK_IN,
      section,
      timestamp: new Date(),
    };
    setReservations(prev => [...prev, newRes]);
  };

  const updateStatus = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleToggleView = () => {
    if (view === 'customer') {
      setIsAuthenticating(true);
    } else {
      setView('customer');
    }
  };

  const handlePinSuccess = () => {
    setIsAuthenticating(false);
    setView('staff');
  };

  const handlePinCancel = () => {
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100 font-sans">
      <Header onViewToggle={handleToggleView} currentView={view} />

      <main className="flex-1 overflow-y-auto relative">
        {isAuthenticating && (
          <PinEntry onSuccess={handlePinSuccess} onCancel={handlePinCancel} />
        )}

        {!isAuthenticating && (
          <>
            {view === 'customer' ? (
              <div className="px-6 py-8">
                {!isSuccess ? (
                  <>
                    <div className="text-center mb-10 space-y-3">
                      <h2 className="text-4xl text-emsherif-navy font-serif">Table Reservation</h2>
                      <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto"></div>
                      <p className="text-gray-400 text-sm font-light tracking-wide px-4">
                        Secure your exquisite dining experience at Em Sherif Café.
                      </p>
                    </div>

                    <BookingForm
                      onSubmit={handleBooking}
                      currentReservations={reservations}
                      tableConfig={tableConfig}
                    />
                  </>
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <UserStatus
                      reservation={activeRes!}
                      onCancel={() => {
                        updateStatus(activeRes!.id, ReservationStatus.CANCELLED);
                        setIsSuccess(false);
                        setActiveRes(null);
                      }}
                    />
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setActiveRes(null);
                      }}
                      className="mt-6 w-full py-4 border border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Book Another Table
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <StaffDashboard
                reservations={reservations}
                onUpdateStatus={updateStatus}
                onAddWalkIn={handleAddWalkIn}
                tableConfig={tableConfig}
                onUpdateConfig={setTableConfig}
              />
            )}
          </>
        )}
      </main>

      <footer className="p-6 text-center border-t border-gray-50">
        <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em]">Em Sherif Café • Beirut, Lebanon</p>
      </footer>
    </div>
  );
};

export default App;
