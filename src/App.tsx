import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { HeroSearchWidget } from './components/HeroSearchWidget';
import { SearchProgressAnimation } from './components/SearchProgressAnimation';
import { MatchCard } from './components/MatchCard';
import { BookingModal } from './components/BookingModal';
import { InteractiveRouteMap } from './components/InteractiveRouteMap';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PassengerAccount } from './components/PassengerAccount';
import { AIAssistantChatbot } from './components/AIAssistantChatbot';

import { Booking, DriverRoute, MatchCandidate, MatchingSearchResult, MatchingWeights, PassengerPreferences, PassengerRequest, PickupType, RideType, TimeWindow, Location } from './types';
import { tripRepository } from './lib/repositories/tripRepository';
import { MatchingEngine } from './lib/matching/matchingEngine';
import { VIETNAM_LOCATIONS } from './lib/routing/routingProvider';
import { Sparkles, Route, ShieldCheck, TrendingDown, Users, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Car } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('passenger');
  const [drivers, setDrivers] = useState<DriverRoute[]>(tripRepository.getDrivers());
  const [passengers, setPassengers] = useState<PassengerRequest[]>(tripRepository.getPassengers());
  const [bookings, setBookings] = useState<Booking[]>(tripRepository.getBookings());
  const [weights, setWeights] = useState<MatchingWeights>(tripRepository.getWeights());

  // Search & Matching State
  const [currentRequest, setCurrentRequest] = useState<PassengerRequest>({
    id: 'PR_ACTIVE_01',
    passengerName: 'Nguyễn Thu Trang',
    passengerPhone: '0901 234 567',
    origin: VIETNAM_LOCATIONS.HN_GIAP_BAT,
    destination: VIETNAM_LOCATIONS.NB_CENTRAL,
    departureWindow: {
      start: '08:00',
      end: '08:45',
      date: '2026-08-20',
    },
    seats: 2,
    rideType: 'shared',
    pickupType: 'meeting_point',
    preferences: {
      noSmoking: true,
      quietRide: true,
      petFriendly: false,
      largeTrunk: false,
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const [matchingResult, setMatchingResult] = useState<MatchingSearchResult>(() =>
    MatchingEngine.findMatches(currentRequest, drivers, weights)
  );

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(
    matchingResult.matchedCandidates[0] || null
  );

  const [candidateToBook, setCandidateToBook] = useState<MatchCandidate | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearch = (searchParams: {
    origin: Location;
    destination: Location;
    departureWindow: TimeWindow;
    seats: number;
    rideType: RideType;
    pickupType: PickupType;
    preferences: PassengerPreferences;
  }) => {
    const updatedRequest: PassengerRequest = {
      ...currentRequest,
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureWindow: searchParams.departureWindow,
      seats: searchParams.seats,
      rideType: searchParams.rideType,
      pickupType: searchParams.pickupType,
      preferences: searchParams.preferences,
    };

    setCurrentRequest(updatedRequest);
    setIsSearching(true);
    setShowProgress(true);
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    setIsSearching(false);
    const result = MatchingEngine.findMatches(currentRequest, drivers, weights);
    setMatchingResult(result);
    setSelectedCandidate(result.matchedCandidates[0] || null);
    if (result.matchedCandidates.length > 0) {
      showToast(`Đã tự động ghép chuyến thành công với tài xế ${result.matchedCandidates[0].driverRoute.driver.name}!`);
    } else {
      showToast('Không tìm thấy tài xế nào cùng hành lang trong khung giờ này.');
    }
  };

  const handleResetDemoScenario = () => {
    setIsResetting(true);
    tripRepository.resetToDefault();
    setTimeout(() => {
      setDrivers(tripRepository.getDrivers());
      setPassengers(tripRepository.getPassengers());
      setBookings(tripRepository.getBookings());
      setWeights(tripRepository.getWeights());

      const defaultReq: PassengerRequest = {
        id: 'PR_ACTIVE_01',
        passengerName: 'Nguyễn Thu Trang',
        passengerPhone: '0901 234 567',
        origin: VIETNAM_LOCATIONS.HN_GIAP_BAT,
        destination: VIETNAM_LOCATIONS.NB_CENTRAL,
        departureWindow: {
          start: '08:00',
          end: '08:45',
          date: '2026-08-20',
        },
        seats: 2,
        rideType: 'shared',
        pickupType: 'meeting_point',
        preferences: {
          noSmoking: true,
          quietRide: true,
          petFriendly: false,
          largeTrunk: false,
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setCurrentRequest(defaultReq);
      const res = MatchingEngine.findMatches(defaultReq, tripRepository.getDrivers(), tripRepository.getWeights());
      setMatchingResult(res);
      setSelectedCandidate(res.matchedCandidates[0] || null);
      setIsResetting(false);
      showToast('Đã làm mới dữ liệu hệ thống!');
    }, 400);
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    tripRepository.createBooking(newBooking);
    setBookings(tripRepository.getBookings());
    setDrivers([...tripRepository.getDrivers()]);
    setPassengers([...tripRepository.getPassengers()]);

    // Recalculate match result
    const res = MatchingEngine.findMatches(currentRequest, tripRepository.getDrivers(), weights);
    setMatchingResult(res);
    showToast(`Đặt chuyến thành công! Mã vé: ${newBooking.id}`);
  };

  const handleWeightsChange = (newWeights: MatchingWeights) => {
    setWeights(newWeights);
    tripRepository.updateWeights(newWeights);
    const res = MatchingEngine.findMatches(currentRequest, drivers, newWeights);
    setMatchingResult(res);
    setSelectedCandidate(res.matchedCandidates[0] || null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        bookingsCount={bookings.length}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Body Content */}
      <main className="flex-1">
        {/* TAB 1: PASSENGER BOOKING & SEARCH */}
        {currentTab === 'passenger' && (
          <div className="space-y-6 pb-16">
            {/* Search & Auto-match Request Widget */}
            <HeroSearchWidget onSearch={handleSearch} isSearching={isSearching} />

            {/* Progress Animation during matching computation */}
            {showProgress && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchProgressAnimation
                  onComplete={handleProgressComplete}
                  originName={currentRequest.origin.name}
                  destName={currentRequest.destination.name}
                />
              </div>
            )}

            {/* Search Results Area */}
            {!showProgress && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        Chuyến xe tự động ghép phù hợp nhất
                      </h2>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tự động điều phối</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lộ trình: <strong>{currentRequest.origin.name}</strong> → <strong>{currentRequest.destination.name}</strong> • Khung giờ: <strong>{currentRequest.departureWindow.start} - {currentRequest.departureWindow.end}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold rounded-lg border border-indigo-200 flex items-center space-x-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span>{matchingResult.matchedCandidates.length} chuyến xe khả dụng trên tuyến</span>
                    </span>
                  </div>
                </div>

                {/* Main Split Content: Cards on Left / Interactive Map on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Match Candidates List */}
                  <div className="lg:col-span-6 space-y-4">
                    {matchingResult.matchedCandidates.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">Không tìm thấy chuyến xe cùng hành lang</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Hiện tại chưa có tài xế nào có lộ trình giao cắt với hành lang tuyến của bạn trong khung giờ này. Bạn có thể thử thay đổi khung giờ đón hoặc chuyển sang hình thức đón trung chuyển.
                        </p>
                      </div>
                    ) : (
                      matchingResult.matchedCandidates.map((candidate, idx) => (
                        <MatchCard
                          key={candidate.driverRoute.id}
                          candidate={candidate}
                          isTopChoice={idx === 0}
                          isSelected={selectedCandidate?.driverRoute.id === candidate.driverRoute.id}
                          onSelect={(c) => setCandidateToBook(c)}
                          onViewMap={(c) => setSelectedCandidate(c)}
                        />
                      ))
                    )}
                  </div>

                  {/* Right Column: Sticky Interactive Map */}
                  <div className="lg:col-span-6 sticky top-20">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">Bản đồ Lộ trình Tuyến xe</h3>
                          <p className="text-[11px] text-slate-500">
                            {selectedCandidate
                              ? `Tài xế ${selectedCandidate.driverRoute.driver.name} • ${selectedCandidate.driverRoute.vehicle.model} (${selectedCandidate.driverRoute.vehicle.licensePlate})`
                              : 'Chọn một chuyến xe bên trái để xem trực quan'}
                          </p>
                        </div>
                        {selectedCandidate && (
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            Đón lúc: {selectedCandidate.driverRoute.departureWindow.start}
                          </span>
                        )}
                      </div>

                      <InteractiveRouteMap
                        candidate={selectedCandidate}
                        passengerRequest={currentRequest}
                        heightClass="h-[520px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Value Proposition Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Route className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Tự động ghép thông minh</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Hệ thống tự động phân bổ tài xế chạy cùng trục cao tốc/quốc lộ, đảm bảo lộ trình thuận tiện và không lòng vòng.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Tiết kiệm 40% - 60% chi phí</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Tăng tỷ lệ lấp đầy ghế giúp tài xế giảm giá vé cho khách mà vẫn đạt doanh thu tối ưu mỗi chuyến.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">An toàn & Đã xác thực</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        100% tài xế đối tác được kiểm duyệt CCCD, giấy phép lái xe, đăng kiểm và điểm tin cậy hành trình.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DRIVER DASHBOARD VIEW */}
        {currentTab === 'driver' && (
          <DriverDashboard drivers={drivers} passengers={passengers} />
        )}

        {/* TAB 3: ADMIN & ALGORITHM TUNING VIEW */}
        {currentTab === 'admin' && (
          <AdminDashboard
            drivers={drivers}
            passengers={passengers}
            onWeightsChange={handleWeightsChange}
          />
        )}

        {/* TAB 4: PASSENGER ACCOUNT VIEW */}
        {currentTab === 'account' && (
          <PassengerAccount bookings={bookings} />
        )}
      </main>

      {/* Booking Confirmation Modal */}
      {candidateToBook && (
        <BookingModal
          candidate={candidateToBook}
          onClose={() => setCandidateToBook(null)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Floating AI Assistant Chatbot */}
      <AIAssistantChatbot />
    </div>
  );
}
export default App;
