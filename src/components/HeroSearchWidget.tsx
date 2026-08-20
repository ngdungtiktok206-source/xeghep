import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, Users, Shield, Sparkles, ChevronRight, CheckCircle2, Sliders, ArrowRightLeft } from 'lucide-react';
import { Location, PassengerPreferences, PickupType, RideType, TimeWindow } from '../types';
import { VIETNAM_LOCATIONS } from '../lib/routing/routingProvider';

interface HeroSearchWidgetProps {
  onSearch: (searchParams: {
    origin: Location;
    destination: Location;
    departureWindow: TimeWindow;
    seats: number;
    rideType: RideType;
    pickupType: PickupType;
    preferences: PassengerPreferences;
  }) => void;
  isSearching?: boolean;
}

export const HeroSearchWidget: React.FC<HeroSearchWidgetProps> = ({ onSearch, isSearching = false }) => {
  const [originId, setOriginId] = useState<string>('HN_GIAP_BAT');
  const [destId, setDestId] = useState<string>('NB_CENTRAL');
  const [date, setDate] = useState<string>('2026-08-20');
  const [timeWindow, setTimeWindow] = useState<{ start: string; end: string }>({ start: '08:00', end: '08:45' });
  const [seats, setSeats] = useState<number>(2);
  const [rideType, setRideType] = useState<RideType>('shared');
  const [pickupType, setPickupType] = useState<PickupType>('meeting_point');

  const [preferences, setPreferences] = useState<PassengerPreferences>({
    noSmoking: true,
    quietRide: true,
    petFriendly: false,
    largeTrunk: false,
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleSwap = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = VIETNAM_LOCATIONS[originId] || VIETNAM_LOCATIONS.HN_GIAP_BAT;
    const destination = VIETNAM_LOCATIONS[destId] || VIETNAM_LOCATIONS.NB_CENTRAL;

    onSearch({
      origin,
      destination,
      departureWindow: {
        start: timeWindow.start,
        end: timeWindow.end,
        date,
      },
      seats,
      rideType,
      pickupType,
      preferences,
    });
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative subtle background mesh */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Hero Typography */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hệ thống điều phối xe tự động</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
            Đi chung một tuyến. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300">
              Tự động ghép chuyến tức thì.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nhập điểm đón và trả, hệ thống sẽ tự động ghép bạn với xe có hành lang lộ tuyến phù hợp nhất, đón trả thuận tiện và tiết kiệm chi phí tối đa.
          </p>
        </div>

        {/* Main Booking Search Card */}
        <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-100">
          {/* Ride Type & Pickup Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            {/* Ride Type Radio Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRideType('shared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rideType === 'shared' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ghép ghế (Tiết kiệm nhất)
              </button>
              <button
                type="button"
                onClick={() => setRideType('row')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rideType === 'row' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bao hàng ghế
              </button>
              <button
                type="button"
                onClick={() => setRideType('private')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rideType === 'private' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bao nguyên xe
              </button>
            </div>

            {/* Pickup Method Toggle */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Hình thức đón:</span>
              <button
                type="button"
                onClick={() => setPickupType('meeting_point')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  pickupType === 'meeting_point'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Điểm đón trung chuyển (Miễn phí)
              </button>
              <button
                type="button"
                onClick={() => setPickupType('door_to_door')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  pickupType === 'door_to_door'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Đón tận nơi (+30k)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-4">
              {/* Origin */}
              <div className="lg:col-span-4 relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm xuất phát / Đón</span>
                </label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <optgroup label="Hà Nội">
                    <option value="HN_GIAP_BAT">Bến xe Giáp Bát / Giải Phóng, Hà Nội</option>
                    <option value="HN_HOAN_KIEM">Bờ Hồ Hoàn Kiếm, Hà Nội</option>
                    <option value="HN_MY_DINH">Bến xe Mỹ Đình, Hà Nội</option>
                    <option value="HN_NUOC_NGAM">Bến xe Nước Ngầm (Đầu cao tốc Pháp Vân)</option>
                    <option value="HN_HA_DONG">KĐT Văn Quán, Hà Đông, Hà Nội</option>
                    <option value="HN_LONG_BIEN">Aeon Mall Long Biên, Hà Nội</option>
                  </optgroup>
                  <optgroup label="Hà Nam">
                    <option value="HNAM_PHU_LY">TP. Phủ Lý (Nút giao Liêm Tuyền)</option>
                    <option value="HNAM_DONG_VAN">KCN Đồng Văn, Duy Tiên, Hà Nam</option>
                  </optgroup>
                  <optgroup label="Ninh Bình">
                    <option value="NB_CENTRAL">TP. Ninh Bình (Quảng trường)</option>
                  </optgroup>
                </select>
              </div>

              {/* Swap Button (Mobile hidden / Desktop centered) */}
              <div className="hidden lg:flex lg:col-span-1 items-end justify-center pb-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300 transition-transform active:scale-95 cursor-pointer"
                  title="Đảo chiều lộ trình"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className="lg:col-span-4 relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-rose-600" />
                  <span>Điểm đến / Trả</span>
                </label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <optgroup label="Ninh Bình">
                    <option value="NB_CENTRAL">TP. Ninh Bình (Quảng trường Đinh Tiên Hoàng)</option>
                    <option value="NB_TRANG_AN">KDL Sinh thái Tràng An / Bái Đính</option>
                    <option value="NB_TAM_DIEP">TP. Tam Điệp, Ninh Bình</option>
                  </optgroup>
                  <optgroup label="Nam Định">
                    <option value="ND_BIG_C">Go! Nam Định (Nút giao Big C)</option>
                    <option value="ND_CENTRAL">Trung tâm TP. Nam Định</option>
                    <option value="ND_Y_YEN">Thị trấn Lâm, Ý Yên, Nam Định</option>
                  </optgroup>
                  <optgroup label="Thanh Hóa">
                    <option value="TH_CENTRAL">TP. Thanh Hóa (Tượng đài Lê Lợi)</option>
                    <option value="TH_SAM_SON">Bãi biển Sầm Sơn, Thanh Hóa</option>
                  </optgroup>
                  <optgroup label="Hải Phòng / Hải Dương">
                    <option value="HP_CENTRAL">Nhà hát lớn Hải Phòng (Tuyến Đông)</option>
                    <option value="HD_CENTRAL">TP. Hải Dương (Nút giao Gia Lộc)</option>
                  </optgroup>
                  <optgroup label="Hà Nội">
                    <option value="HN_GIAP_BAT">Bến xe Giáp Bát, Hà Nội</option>
                  </optgroup>
                </select>
              </div>

              {/* Departure Time & Date */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Khung giờ & Ghế</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={`${timeWindow.start}-${timeWindow.end}`}
                    onChange={(e) => {
                      const [start, end] = e.target.value.split('-');
                      setTimeWindow({ start, end });
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="08:00-08:45">08:00 - 08:45</option>
                    <option value="08:30-09:15">08:30 - 09:15</option>
                    <option value="09:00-10:00">09:00 - 10:00</option>
                    <option value="14:00-15:00">14:00 - 15:00</option>
                    <option value="18:00-19:00">18:00 - 19:00</option>
                  </select>

                  <select
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={1}>1 người (1 ghế)</option>
                    <option value={2}>2 người (2 ghế)</option>
                    <option value={3}>3 người (3 ghế)</option>
                    <option value={4}>4 người (4 ghế)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Toggle Advanced Preferences */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Thêm sở thích di chuyển & hành lý'}</span>
              </button>

              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-70 active:scale-98"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tự động ghép chuyến...</span>
                  </>
                ) : (
                  <>
                    <span>Tự động ghép xe theo tuyến</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Advanced Preferences Panel */}
            {showAdvanced && (
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.noSmoking}
                    onChange={(e) => setPreferences({ ...preferences, noSmoking: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Không hút thuốc</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietRide}
                    onChange={(e) => setPreferences({ ...preferences, quietRide: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Không gian yên tĩnh</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.largeTrunk}
                    onChange={(e) => setPreferences({ ...preferences, largeTrunk: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Cần cốp để hành lý lớn</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.petFriendly}
                    onChange={(e) => setPreferences({ ...preferences, petFriendly: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Mang thú cưng nhỏ</span>
                </label>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
