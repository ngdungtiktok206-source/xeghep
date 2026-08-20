import React, { useState } from 'react';
import { Booking, MatchCandidate } from '../types';
import { X, CheckCircle2, ShieldCheck, MapPin, Navigation, Clock, User, Phone, CreditCard, Banknote, Sparkles, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  candidate: MatchCandidate | null;
  onClose: () => void;
  onConfirmBooking: (bookingData: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  candidate,
  onClose,
  onConfirmBooking,
}) => {
  if (!candidate) return null;

  const { driverRoute, passengerRequest, pricing } = candidate;

  const [passengerName, setPassengerName] = useState<string>(passengerRequest.passengerName || 'Nguyễn Thu Trang');
  const [passengerPhone, setPassengerPhone] = useState<string>(passengerRequest.passengerPhone || '0901 234 567');
  const [pickupNote, setPickupNote] = useState<string>('Vui lòng gọi trước khi đến 10 phút');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_pickup' | 'paid'>('cash_on_pickup');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookingId = `RS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: bookingId,
      passengerRequestId: passengerRequest.id,
      driverRouteId: driverRoute.id,
      passengerName,
      passengerPhone,
      driverName: driverRoute.driver.name,
      vehicleModel: driverRoute.vehicle.model,
      licensePlate: driverRoute.vehicle.licensePlate,
      originName: passengerRequest.origin.name,
      destinationName: passengerRequest.destination.name,
      departureTime: driverRoute.departureWindow.start,
      departureDate: driverRoute.departureWindow.date,
      seats: passengerRequest.seats,
      rideType: passengerRequest.rideType,
      pickupType: passengerRequest.pickupType,
      totalPrice: pricing.totalPrice,
      paymentStatus: paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedBooking(newBooking);
      setIsConfirmed(true);
      onConfirmBooking(newBooking);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isConfirmed ? (
          <div>
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Xác nhận đặt chuyến ghép xe</h2>
              <p className="text-xs text-slate-500">Mã chuyến xe: {driverRoute.id} • {driverRoute.vehicle.model}</p>
            </div>

            {/* Trip Brief Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span className="flex items-center text-indigo-700">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {driverRoute.departureWindow.start} - {driverRoute.departureWindow.end} ({driverRoute.departureWindow.date})
                </span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold">
                  {passengerRequest.seats} ghế ({passengerRequest.rideType === 'shared' ? 'Ghép ghế' : 'Bao xe'})
                </span>
              </div>
              <div className="text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <p>📍 <strong>Đón:</strong> {passengerRequest.origin.name}</p>
                <p>🏁 <strong>Trả:</strong> {passengerRequest.destination.name}</p>
                <p>🚗 <strong>Tài xế:</strong> {driverRoute.driver.name} ({driverRoute.driver.phone}) • {driverRoute.vehicle.licensePlate}</p>
              </div>
            </div>

            <form onSubmit={handleConfirm} className="space-y-3.5">
              {/* Passenger Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Họ tên hành khách</span>
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ví dụ: Nguyễn Thu Trang"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Số điện thoại đón xe</span>
                </label>
                <input
                  type="tel"
                  required
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ví dụ: 0901 234 567"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho tài xế (Tùy chọn)</label>
                <input
                  type="text"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Điểm đứng dễ thấy, hành lý cồng kềnh..."
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phương thức thanh toán</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_pickup')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                      paymentMethod === 'cash_on_pickup'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Trả tiền mặt khi lên xe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paid')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                      paymentMethod === 'paid'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Chuyển khoản / VietQR</span>
                  </button>
                </div>
              </div>

              {/* Price Receipt Summary */}
              <div className="bg-slate-100/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Giá cơ bản ({passengerRequest.seats} ghế):</span>
                  <span>{pricing.basePrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quãng đường (~{pricing.distanceKm} km):</span>
                  <span>{pricing.distanceCharge.toLocaleString('vi-VN')}đ</span>
                </div>
                {pricing.pickupSurcharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Phụ thu đón tận nơi:</span>
                    <span>+{pricing.pickupSurcharge.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {pricing.sharedRideDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Ưu đãi ghép xe lộ tuyến (15%):</span>
                    <span>-{pricing.sharedRideDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-indigo-700">{pricing.totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác nhận với tài xế...</span>
                  </>
                ) : (
                  <>
                    <span>Hoàn tất đặt {passengerRequest.seats} ghế • {pricing.totalPrice.toLocaleString('vi-VN')}đ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-in zoom-in-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Đặt chuyến ghép xe thành công!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mã đặt chỗ của bạn: <strong className="text-indigo-600 font-mono text-sm">{confirmedBooking?.id}</strong>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-left mb-5 border border-slate-200 space-y-1.5">
              <p>👤 <strong>Hành khách:</strong> {confirmedBooking?.passengerName} ({confirmedBooking?.passengerPhone})</p>
              <p>🚗 <strong>Tài xế đón:</strong> {confirmedBooking?.driverName} ({driverRoute.driver.phone})</p>
              <p>🚘 <strong>Xe đón:</strong> {confirmedBooking?.vehicleModel} • {confirmedBooking?.licensePlate}</p>
              <p>⏰ <strong>Thời gian:</strong> {confirmedBooking?.departureTime} ngày {confirmedBooking?.departureDate}</p>
              <p>💰 <strong>Tổng thanh toán:</strong> {confirmedBooking?.totalPrice.toLocaleString('vi-VN')}đ</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Xem trong Danh sách chuyến đi của tôi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
