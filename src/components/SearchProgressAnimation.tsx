import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Route, Users, ShieldAlert, Cpu } from 'lucide-react';

interface SearchProgressAnimationProps {
  onComplete: () => void;
  originName: string;
  destName: string;
}

export const SearchProgressAnimation: React.FC<SearchProgressAnimationProps> = ({
  onComplete,
  originName,
  destName,
}) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    { title: 'Xác định hành lang tuyến di chuyển', desc: `${originName} → ${destName}` },
    { title: 'Quét và lọc các tài xế cùng lộ trình và khung giờ', desc: 'Kiểm tra hướng di chuyển trên các trục cao tốc / quốc lộ' },
    { title: 'Tối ưu hóa điểm đón trả và quãng đường di chuyển', desc: 'Tự động tính toán phương án thuận tiện nhất' },
    { title: 'Tự động ghép xe phù hợp nhất theo yêu cầu', desc: 'Đã hoàn tất ghép chuyến xe tối ưu cho bạn' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 300);
    const timer2 = setTimeout(() => setStep(2), 700);
    const timer3 = setTimeout(() => setStep(3), 1100);
    const timer4 = setTimeout(() => {
      setStep(4);
      setTimeout(onComplete, 400);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-lg max-w-xl mx-auto my-6">
      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Thuật toán ghép xe lộ tuyến đang xử lý</h3>
          <p className="text-xs text-slate-500">Đang phân tích dữ liệu hành lang & tối ưu quãng đường đón</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((s, index) => {
          const isDone = step > index;
          const isCurrent = step === index;

          return (
            <div
              key={index}
              className={`flex items-start space-x-3 text-xs transition-all duration-300 ${
                isDone
                  ? 'text-slate-800'
                  : isCurrent
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in-50" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                    {index + 1}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-[11px] text-slate-500 font-normal">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
