import React from 'react';
import { Booking } from '../types';
import { User, ShieldCheck, Clock, MapPin, Navigation, Car, Phone, Award, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

interface PassengerAccountProps {
  bookings: Booking[];
}

export const PassengerAccount: React.FC<PassengerAccountProps> = ({ bookings }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-200">
            TT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">Nguyễn Thu Trang</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hành khách Xác thực</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">SĐT: 0901 234 567 • Email: trang.nguyen@example.com</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-[11px] text-slate-500 block">Điểm tin cậy</span>
            <strong className="text-sm font-extrabold text-indigo-700">98 / 100</strong>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <span className="text-[11px] text-slate-500 block">Tỷ lệ hủy chuyến</span>
            <strong className="text-sm font-extrabold text-emerald-600">0.8%</strong>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Danh sách vé & Chuyến đi đã đặt</h2>
          <span className="text-xs text-slate-500">{bookings.length} chuyến</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">Bạn chưa có chuyến đi nào được đặt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-700 text-xs px-2 py-0.5 bg-indigo-100 rounded-md">
                      {b.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {b.departureDate} • {b.departureTime}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã xác nhận chuyến</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-slate-600">
                      📍 <strong>Đón:</strong> {b.originName}
                    </p>
                    <p className="text-slate-600">
                      🏁 <strong>Trả:</strong> {b.destinationName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600">
                      🚗 <strong>Tài xế:</strong> {b.driverName} • {b.vehicleModel} ({b.licensePlate})
                    </p>
                    <p className="text-slate-600">
                      👥 <strong>Số ghế:</strong> {b.seats} ghế ({b.rideType === 'shared' ? 'Ghép ghế' : 'Bao xe'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500">Tổng thanh toán: </span>
                    <strong className="text-indigo-900 font-bold text-sm">
                      {b.totalPrice.toLocaleString('vi-VN')}đ
                    </strong>
                    <span className="text-slate-400 text-[11px] ml-1">({b.paymentStatus === 'paid' ? 'Đã thanh toán online' : 'Thanh toán khi lên xe'})</span>
                  </div>

                  <button
                    onClick={() => alert(`Biên lai điện tử #${b.id} đã được gửi tới email của bạn!`)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem biên lai vé</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
