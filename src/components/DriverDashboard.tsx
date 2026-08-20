import React, { useState } from 'react';
import { DriverRoute, PassengerRequest, Waypoint } from '../types';
import { Car, Users, TrendingUp, DollarSign, MapPin, Navigation, Clock, Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { InteractiveRouteMap } from './InteractiveRouteMap';

interface DriverDashboardProps {
  drivers: DriverRoute[];
  passengers: PassengerRequest[];
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ drivers, passengers }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || 'DRV_01');
  const [passengerStatuses, setPassengerStatuses] = useState<Record<string, 'waiting' | 'picked_up' | 'completed'>>({
    PR_SEED_01: 'waiting',
    PR_SEED_02: 'waiting',
    PR_01: 'waiting',
    PR_02: 'picked_up',
  });

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  if (!currentDriver) return null;

  // Find matched passengers for this driver
  const matchedPassengers = passengers.filter(
    (p) => currentDriver.matchedPassengerIds.includes(p.id) || p.status === 'confirmed'
  );

  const togglePassengerStatus = (pId: string) => {
    setPassengerStatuses((prev) => {
      const current = prev[pId] || 'waiting';
      const next = current === 'waiting' ? 'picked_up' : current === 'picked_up' ? 'completed' : 'waiting';
      return { ...prev, [pId]: next };
    });
  };

  const fillRate = ((currentDriver.occupiedSeats / currentDriver.vehicle.totalSeats) * 100).toFixed(1);
  const revenue = currentDriver.occupiedSeats * currentDriver.basePricePerSeat;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Driver Profile Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentDriver.driver.avatar}
            alt={currentDriver.driver.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{currentDriver.driver.name}</h1>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                Tài xế Đối tác RouteShare
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Xe: <strong>{currentDriver.vehicle.model}</strong> • Biển số: <strong className="font-mono text-slate-800">{currentDriver.vehicle.licensePlate}</strong> ({currentDriver.vehicle.totalSeats} chỗ)
            </p>
          </div>
        </div>

        {/* Driver Account Switcher */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Xem góc nhìn tài xế:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.driver.name} - {d.origin.province} → {d.destination.province} ({d.vehicle.totalSeats} chỗ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Chuyến hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">5 <span className="text-xs font-normal text-slate-500">chuyến</span></div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Đã hoàn thành 3 chuyến</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Ghế đã lấp đầy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {currentDriver.occupiedSeats} <span className="text-xs font-normal text-slate-500">/ {currentDriver.vehicle.totalSeats} ghế</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Còn trống {currentDriver.availableSeats} ghế</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Tỷ lệ lấp đầy (Fill Rate)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{fillRate}%</div>
          <p className="text-[11px] text-sky-600 font-medium mt-1">Tối ưu hơn 35% so với chạy xe rỗng</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Doanh thu chuyến này</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{revenue.toLocaleString('vi-VN')}đ</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Đã bao gồm phụ thu đón tận nơi</p>
        </div>
      </div>

      {/* Main Trip Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Details & Matched Passengers List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Route Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-sm font-bold text-slate-900">Lộ trình chuyến đang sẵn sàng</h3>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Giờ chạy: {currentDriver.departureWindow.start} - {currentDriver.departureWindow.end}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Điểm xuất phát:</span>
                <strong className="text-slate-800 text-xs">{currentDriver.origin.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Đích đến:</span>
                <strong className="text-slate-800 text-xs">{currentDriver.destination.name}</strong>
              </div>
            </div>

            {/* Optimized Waypoints Sequence */}
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Thứ tự điểm đón / trả đã tối ưu (Route Waypoints):
            </h4>
            <div className="space-y-2">
              {currentDriver.waypoints.map((wp, idx) => (
                <div key={wp.id} className="flex items-center space-x-3 text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{wp.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {wp.type === 'origin'
                        ? 'Điểm xuất phát tài xế'
                        : wp.type === 'destination'
                        ? 'Điểm kết thúc hành trình'
                        : 'Điểm trung chuyển dọc cao tốc (Corridor stop)'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {idx === 0 ? currentDriver.departureWindow.start : `+${idx * 25}p`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Passengers List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Danh sách khách ghép trên xe ({currentDriver.occupiedSeats} người)</h3>
              <span className="text-xs text-slate-500">Thuật toán ghép tự động</span>
            </div>

            <div className="space-y-3">
              {matchedPassengers.slice(0, 3).map((p, idx) => {
                const status = passengerStatuses[p.id] || 'waiting';

                return (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {p.passengerName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{p.passengerName}</h4>
                          <p className="text-[11px] text-slate-500">{p.passengerPhone}</p>
                        </div>
                      </div>

                      {/* Status pill & toggle */}
                      <button
                        onClick={() => togglePassengerStatus(p.id)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'picked_up'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status === 'waiting' && '⏳ Chờ đón tại điểm'}
                        {status === 'picked_up' && '🚗 Đã lên xe'}
                        {status === 'completed' && '✓ Đã trả khách an toàn'}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <p>📍 <strong>Điểm đón:</strong> {p.origin.name}</p>
                      <p>🏁 <strong>Điểm trả:</strong> {p.destination.name}</p>
                      <p>👥 <strong>Số ghế:</strong> {p.seats} ghế • <strong>Tiền vé:</strong> {(p.seats * currentDriver.basePricePerSeat).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map View */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Bản đồ lộ trình & Điểm đón khách</h3>
            <InteractiveRouteMap driverRoute={currentDriver} heightClass="h-[460px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
