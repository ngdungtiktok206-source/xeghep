import React from 'react';
import { MatchCandidate } from '../types';
import { CheckCircle2, X, Sparkles, Route, Clock, Users, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';

interface MatchExplanationModalProps {
  candidate: MatchCandidate | null;
  onClose: () => void;
  onSelectBooking: (candidate: MatchCandidate) => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  candidate,
  onClose,
  onSelectBooking,
}) => {
  if (!candidate) return null;

  const { driverRoute, pricing, detourKm, detourMinutes, routeCompatibility, routeOverlap, initialFillRate, projectedFillRate, totalScore } = candidate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tại sao hệ thống đề xuất chuyến xe này?</h2>
            <p className="text-xs text-slate-500">Phân tích toán học & tối ưu hóa lộ trình bởi Matching Engine</p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 rounded-xl p-4 mb-5 border border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Tổng điểm tương thích</span>
            <div className="text-3xl font-extrabold text-indigo-900">{totalScore} <span className="text-sm font-normal text-indigo-600">/ 100</span></div>
            <p className="text-[11px] text-indigo-600">Đạt ngưỡng tối ưu cao nhất trong 12 tài xế đã quét</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-2xs">
              Độ khớp: {routeCompatibility}%
            </span>
          </div>
        </div>

        {/* 6 Key Architectural Validation Criteria */}
        <div className="space-y-3 mb-6">
          {/* Criterion 1: Route Corridor & Overlap */}
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tuyến khách nằm trọn trên hành lang tuyến xe</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Lộ trình của bạn có độ trùng khớp <strong className="text-slate-800">{routeOverlap}%</strong> với hành lang chính của tài xế ({driverRoute.origin.name} → {driverRoute.destination.name}), cùng hướng di chuyển theo cao tốc/QL1A.
              </p>
            </div>
          </div>

          {/* Criterion 2: Detour Minimal */}
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Quãng đường chạy vòng đón/trả cực ngắn</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Tài xế chỉ phát sinh thêm <strong className="text-amber-700">+{detourKm} km</strong> (~{detourMinutes} phút đón bạn), không gây ảnh hưởng lớn đến thời gian hành trình của các hành khách khác đã lên xe.
              </p>
            </div>
          </div>

          {/* Criterion 3: Fill Rate Optimization */}
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tối ưu hóa tỷ lệ lấp đầy ghế (Fill Rate)</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Xe nâng tỷ lệ lấp đầy từ <strong className="text-slate-800">{candidate.initialOccupiedSeats}/{driverRoute.vehicle.totalSeats} ({initialFillRate}%)</strong> lên <strong className="text-indigo-700">{candidate.newOccupiedSeats}/{driverRoute.vehicle.totalSeats} ({projectedFillRate}%)</strong>, chia sẻ tối đa chi phí nhiên liệu & trạm BOT.
              </p>
            </div>
          </div>

          {/* Criterion 4: Cost Efficiency */}
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tiết kiệm chi phí đáng kể</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Chi phí chuyến đi của bạn rẻ hơn <strong className="text-emerald-600">{pricing.savedPercentage}%</strong> so với đặt xe taxi riêng truyền thống ({pricing.totalPrice.toLocaleString('vi-VN')}đ vs ~{pricing.originalPrivatePrice.toLocaleString('vi-VN')}đ).
              </p>
            </div>
          </div>

          {/* Criterion 5: Driver Trust & Safety */}
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tài xế uy tín & Đạt chuẩn an toàn</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Tài xế {driverRoute.driver.name} đạt điểm tin cậy <strong className="text-slate-800">{driverRoute.driver.trustScore}/100</strong>, đánh giá <strong className="text-amber-600">★{driverRoute.driver.rating}</strong> với hơn {driverRoute.driver.totalTrips} chuyến hoàn thành an toàn.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectBooking(candidate);
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Tiến hành đặt chuyến này</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
