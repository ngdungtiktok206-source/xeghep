import React from 'react';
import { MatchCandidate } from '../types';
import { Star, ShieldCheck, MapPin, Navigation, Clock, Users, Sparkles, ChevronRight, Check, Eye, CheckCircle2 } from 'lucide-react';

interface MatchCardProps {
  candidate: MatchCandidate;
  isTopChoice?: boolean;
  isSelected?: boolean;
  onSelect: (candidate: MatchCandidate) => void;
  onViewMap: (candidate: MatchCandidate) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  candidate,
  isTopChoice = false,
  isSelected = false,
  onSelect,
  onViewMap,
}) => {
  const { driverRoute, passengerRequest, pricing } = candidate;
  const { driver, vehicle, origin, destination, departureWindow } = driverRoute;
  const remainingSeats = Math.max(0, vehicle.totalSeats - candidate.newOccupiedSeats);

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border transition-all duration-200 ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-lg'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Auto Matched Badge */}
      {isTopChoice && (
        <div className="absolute -top-3 left-5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Hệ thống tự động ghép chuyến tối ưu nhất</span>
        </div>
      )}

      {/* Driver Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5 pt-1">
        <div className="flex items-center space-x-3">
          <img
            src={driver.avatar}
            alt={driver.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-slate-900">{driver.name}</h3>
              {driver.isIdentityVerified && (
                <span title="Tài xế đã xác thực CCCD & Giấy phép lái xe">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 inline" />
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                {driver.rating}
              </span>
              <span>•</span>
              <span>{driver.totalTrips} chuyến đã chạy</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Độ uy tín cao</span>
            </div>
          </div>
        </div>

        {/* Vehicle Badge */}
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200">
            {vehicle.model}
          </span>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{vehicle.licensePlate}</p>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="bg-slate-50 rounded-xl p-3 mb-3.5 border border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
          <div className="flex items-center space-x-1.5 text-indigo-900">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Khung giờ đón: {departureWindow.start} → {departureWindow.end}</span>
          </div>
          <span className="text-[11px] font-normal text-slate-500">{departureWindow.date}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-slate-600 font-medium truncate">Điểm đón bạn: <strong>{passengerRequest.origin.name}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="text-slate-600 font-medium truncate">Điểm trả: <strong>{passengerRequest.destination.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Passenger-facing Trip Highlights (No internal scores) */}
      <div className="grid grid-cols-3 gap-2 mb-3.5 text-center text-xs">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-medium block">Hình thức đón</span>
          <strong className="text-xs font-bold text-slate-800">
            {passengerRequest.pickupType === 'door_to_door' ? 'Đón tận nơi' : 'Điểm trung chuyển'}
          </strong>
        </div>

        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-medium block">Số ghế đặt</span>
          <strong className="text-xs font-bold text-indigo-900">{passengerRequest.seats} ghế</strong>
        </div>

        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-medium block">Chỗ trống còn lại</span>
          <strong className="text-xs font-bold text-emerald-700">
            {remainingSeats > 0 ? `Còn ${remainingSeats} chỗ` : 'Đủ ghế'}
          </strong>
        </div>
      </div>

      {/* Pricing & Call to Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-extrabold text-indigo-950">
              {pricing.totalPrice.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-xs text-slate-500">/ {passengerRequest.seats} ghế</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Tiết kiệm {pricing.savedPercentage}% so với xe bao
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View on Map Button */}
          <button
            type="button"
            onClick={() => onViewMap(candidate)}
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
            title="Xem lộ trình trên bản đồ"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Book button */}
          <button
            type="button"
            onClick={() => onSelect(candidate)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <span>{isTopChoice ? 'Xác nhận đi chuyến này' : 'Chọn chuyến này'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
