import React from 'react';
import { useGetRoutes } from './useTransport';
import { Bus, MapPin, Phone, UserCheck, ShieldCheck } from 'lucide-react';

const TransportView = () => {
  const { data: routes = [], isLoading } = useGetRoutes();

  const mockRoutes = [
    { id: 1, routeName: 'Route 1 - North Sector', busNumber: 'KA-01-E-1234', driver: 'Rajesh Kumar', phone: '+91 98765 43210', stops: 'Sector 4 -> Sector 11 -> School Main Gate', status: 'On Schedule' },
    { id: 2, routeName: 'Route 2 - East Express', busNumber: 'KA-01-E-5678', driver: 'Suresh Babu', phone: '+91 98765 43211', stops: 'Metro Station -> Civil Lines -> School Main Gate', status: 'On Schedule' },
    { id: 3, routeName: 'Route 3 - South Hub', busNumber: 'KA-01-E-9012', driver: 'Manoj Sharma', phone: '+91 98765 43212', stops: 'Green Park -> Lake View -> School West Gate', status: 'Maintenance' },
  ];

  const displayRoutes = routes.length > 0 ? routes : mockRoutes;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bus className="w-6 h-6 text-indigo-600" /> School Transport & Fleet Tracking
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor active vehicle routes, driver contacts, and student transport status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayRoutes.map((route) => (
          <div key={route.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {route.busNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{route.routeName}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  route.status === 'On Schedule'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {route.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">Driver:</span> {route.driver}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">Contact:</span> {route.phone}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Stops:</span>
                  <p className="text-slate-500">{route.stops}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportView;
