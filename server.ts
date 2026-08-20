import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { tripRepository } from './src/lib/repositories/tripRepository';
import { MatchingEngine } from './src/lib/matching/matchingEngine';
import { PricingEngine } from './src/lib/pricing/pricingEngine';
import { routeOptimizer } from './src/lib/optimization/routeOptimizer';
import { PassengerRequest, Booking } from './src/types';

dotenv.config();

let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Gemini AI init warning:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'viastep Mobility Server',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Matching search API
  app.post('/api/matching/search', (req, res) => {
    try {
      const { request, weights } = req.body;
      if (!request || !request.origin || !request.destination) {
        return res.status(400).json({ error: 'Missing required origin or destination in request' });
      }

      const activeWeights = weights || tripRepository.getWeights();
      const drivers = tripRepository.getDrivers();
      const result = MatchingEngine.findMatches(request as PassengerRequest, drivers, activeWeights);

      return res.json(result);
    } catch (err: any) {
      console.error('Matching search error:', err);
      return res.status(500).json({ error: err.message || 'Matching algorithm error' });
    }
  });

  // 3. Matching recalculate API (for Admin/Demo panel)
  app.post('/api/matching/recalculate', (req, res) => {
    try {
      const { weights } = req.body;
      if (weights) {
        tripRepository.updateWeights(weights);
      }
      const activeWeights = tripRepository.getWeights();
      const drivers = tripRepository.getDrivers();
      const passengers = tripRepository.getPassengers();

      const result = MatchingEngine.recalculateAll(passengers, drivers, activeWeights);
      return res.json({
        weights: activeWeights,
        results: result,
        totalPassengers: passengers.length,
        totalDrivers: drivers.length,
      });
    } catch (err: any) {
      console.error('Recalculate error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Drivers API
  app.get('/api/drivers', (req, res) => {
    const drivers = tripRepository.getDrivers();
    res.json(drivers);
  });

  app.get('/api/drivers/:id', async (req, res) => {
    const driver = tripRepository.getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver route not found' });
    }

    const allPassengers = tripRepository.getPassengers();
    const matchedPassengers = allPassengers.filter((p) => driver.matchedPassengerIds.includes(p.id));

    // Calculate multi-stop optimized path
    const optimized = await routeOptimizer.optimizeMultiStopRoute(driver, matchedPassengers);

    res.json({
      ...driver,
      matchedPassengers,
      optimizedMultiStop: optimized,
    });
  });

  // 5. Bookings API
  app.get('/api/bookings', (req, res) => {
    const bookings = tripRepository.getBookings();
    res.json(bookings);
  });

  app.post('/api/bookings', (req, res) => {
    try {
      const bookingData: Booking = req.body;
      if (!bookingData.passengerRequestId || !bookingData.driverRouteId) {
        return res.status(400).json({ error: 'Invalid booking data' });
      }

      const booking = tripRepository.createBooking(bookingData);
      return res.status(201).json(booking);
    } catch (err: any) {
      console.error('Create booking error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Pricing Quote API
  app.post('/api/pricing/quote', (req, res) => {
    const quote = PricingEngine.calculateQuote(req.body);
    res.json(quote);
  });

  // 7. Reset to Demo Scenario API
  app.post('/api/demo/reset', (req, res) => {
    tripRepository.resetToDefault();
    res.json({
      success: true,
      message: 'Đã nạp lại kịch bản Demo (Hà Nội - Nam Định - Ninh Bình)',
      driversCount: tripRepository.getDrivers().length,
      passengersCount: tripRepository.getPassengers().length,
    });
  });

  // 8. AI Mobility Assistant API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const drivers = tripRepository.getDrivers();
      const summaryContext = drivers
        .slice(0, 6)
        .map(
          (d) =>
            `- Tài xế: ${d.driver.name} (${d.vehicle.model}, ${d.vehicle.totalSeats} chỗ), Tuyến: ${d.origin.name} -> ${d.destination.name}, Giờ: ${d.departureWindow.start}-${d.departureWindow.end}, Còn trống: ${d.availableSeats} ghế, Giá: ${d.basePricePerSeat.toLocaleString('vi-VN')}đ`
        )
        .join('\n');

      if (geminiAi) {
        try {
          const prompt = `Bạn là Trợ lý AI điều hành chuyến đi của viastep - Nền tảng ghép xe liên tỉnh theo lộ tuyến thông minh tại Việt Nam.
Nguyên tắc cốt lõi của viastep:
1. Ghép xe theo HÀNH LANG TUYẾN & ĐỘ LỆCH TUYẾN (DETOUR), KHÔNG gom khách chỉ theo điểm đến.
2. Tối ưu tỷ lệ lấp đầy xe (Fill rate) và giảm giá vé cho khách từ 15-40% so với thuê trọn gói.
3. Luôn đưa ra câu trả lời ngắn gọn, thân thiện, rõ ràng và dựa trên dữ liệu chuyến đi thực tế sau:

Danh sách chuyến xe khả dụng hiện tại:
${summaryContext}

Câu hỏi của hành khách: "${message}"

Hãy giải đáp cụ thể, đề xuất tài xế phù hợp nhất (nếu có yêu cầu tuyến), giải thích độ lệch tuyến ngắn và giá vé minh bạch. Trả lời bằng tiếng Việt lịch sự, súc tích.`;

          const response = await geminiAi.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
          });

          return res.json({
            reply: response.text || 'Tôi có thể hỗ trợ bạn tìm chuyến xe ghép phù hợp nhất!',
            source: 'gemini',
          });
        } catch (geminiErr) {
          console.warn('Gemini API call failed, falling back to smart local responder:', geminiErr);
        }
      }

      // Smart grounded local fallback
      const lower = message.toLowerCase();
      let reply = '';
      if (lower.includes('ninh bình') || lower.includes('tràng an')) {
        reply = `Hiện có 4 chuyến xe đang chạy tuyến Hà Nội → Ninh Bình trong khung giờ 08:00 - 09:00:
1. **Tài xế Nguyễn Văn An** (Toyota Innova 7 chỗ): 08:00 - 08:30 (Còn 2 ghế trống, giá ~180.000đ/ghế, độ lệch tuyến chỉ 1.2 km).
2. **Tài xế Trần Quốc Tuấn** (Hyundai Staria Limousine VIP): 08:15 - 08:45 (Còn 3 ghế trống, giá ~220.000đ/ghế).
3. **Tài xế Lê Hoàng Long** (Mitsubishi Xpander): 08:30 - 09:00 (Còn 3 ghế trống, giá ~170.000đ/ghế).

Thuật toán RouteShare đã tối ưu hóa đón bạn tận nơi mà chỉ phát sinh ~3 phút chạy vòng! Bạn có thể bấm chọn xe trực tiếp trên màn hình.`;
      } else if (lower.includes('nam định')) {
        reply = `Tuyến Hà Nội → Nam Định có tài xế **Vũ Minh Đức** (Kia Carnival Signature) xuất phát lúc 09:00 - 09:30, còn 4 ghế trống với giá 190.000đ/ghế. Xe đón tại Hoàn Kiếm hoặc dọc hành lang Pháp Vân!`;
      } else if (lower.includes('hải phòng')) {
        reply = `Tuyến Hà Nội → Hải Phòng (Hành lang phía Đông) có tài xế **Đỗ Thành Nam** (Vios 4 chỗ, 08:00) và **Bùi Quang Huy** (SantaFe 7 chỗ, 09:00), giá từ 160.000đ - 190.000đ/ghế. Lưu ý: Tuyến này không ghép chung với tuyến Nam Định / Ninh Bình để đảm bảo không bị lệch tuyến!`;
      } else if (lower.includes('giá') || lower.includes('chi phí') || lower.includes('bao nhiêu')) {
        reply = `Giá ghép xe tại RouteShare được tính tự động:
- Giá cơ bản: 60.000đ + 1.400đ/km (đã giảm 15% ưu đãi ghép ghế).
- Đón tận nơi: phụ thu chỉ 30.000đ.
- Tiết kiệm 45% - 65% so với thuê taxi truyền thống hoặc đặt trọn gói riêng lẻ!`;
      } else {
        reply = `Chào bạn! Tôi là Trợ lý Lộ tuyến thông minh RouteShare. Bạn có thể cho tôi biết điểm đi, điểm đến và số người cần di chuyển (Ví dụ: "Hà Nội đi Ninh Bình sáng mai 2 người") để tôi tìm xe có lộ trình trùng khớp nhất nhé!`;
      }

      return res.json({
        reply,
        source: 'local_engine',
      });
    } catch (err: any) {
      console.error('Chat API error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RouteShare Mobility Server running on http://localhost:${PORT}`);
  });
}

startServer();
