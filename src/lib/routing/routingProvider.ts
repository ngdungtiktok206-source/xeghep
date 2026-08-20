import { Coordinates, Location, RouteGeometry, Waypoint } from '../../types';
import { calculateHaversineDistance, calculatePathLength, interpolatePolyline } from './geometry';

/**
 * Standard known interprovincial mobility locations in Northern Vietnam
 */
export const VIETNAM_LOCATIONS: Record<string, Location> = {
  // Hà Nội
  HN_HOAN_KIEM: {
    id: 'HN_HOAN_KIEM',
    name: 'Bờ Hồ Hoàn Kiếm, Hà Nội',
    address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    coords: { lat: 21.0285, lng: 105.8542 },
    province: 'Hà Nội',
    isMeetingPoint: true,
  },
  HN_MY_DINH: {
    id: 'HN_MY_DINH',
    name: 'Bến xe Mỹ Đình, Hà Nội',
    address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội',
    coords: { lat: 21.0287, lng: 105.7785 },
    province: 'Hà Nội',
    isMeetingPoint: true,
  },
  HN_GIAP_BAT: {
    id: 'HN_GIAP_BAT',
    name: 'Bến xe Giáp Bát / Giải Phóng, Hà Nội',
    address: 'Km 6 Giải Phóng, Hoàng Mai, Hà Nội',
    coords: { lat: 20.9818, lng: 105.8415 },
    province: 'Hà Nội',
    isMeetingPoint: true,
  },
  HN_NUOC_NGAM: {
    id: 'HN_NUOC_NGAM',
    name: 'Bến xe Nước Ngầm, Hà Nội (Đầu cao tốc Pháp Vân)',
    address: 'Ngọc Hồi, Hoàng Liệt, Hoàng Mai, Hà Nội',
    coords: { lat: 20.9632, lng: 105.8456 },
    province: 'Hà Nội',
    isMeetingPoint: true,
  },
  HN_HA_DONG: {
    id: 'HN_HA_DONG',
    name: 'KĐT Văn Quán, Hà Đông, Hà Nội',
    address: 'Nguyễn Khuyến, Hà Đông, Hà Nội',
    coords: { lat: 20.9782, lng: 105.7892 },
    province: 'Hà Nội',
  },
  HN_LONG_BIEN: {
    id: 'HN_LONG_BIEN',
    name: 'Aeon Mall Long Biên, Hà Nội',
    address: 'Cổ Linh, Long Biên, Hà Nội',
    coords: { lat: 21.0272, lng: 105.8988 },
    province: 'Hà Nội',
    isMeetingPoint: true,
  },

  // Hà Nam (Phủ Lý)
  HNAM_PHU_LY: {
    id: 'HNAM_PHU_LY',
    name: 'TP. Phủ Lý (Nút giao Liêm Tuyền / BV Việt Đức cơ sở 2)',
    address: 'Liêm Tuyền, Phủ Lý, Hà Nam',
    coords: { lat: 20.5372, lng: 105.9281 },
    province: 'Hà Nam',
    isMeetingPoint: true,
  },
  HNAM_DONG_VAN: {
    id: 'HNAM_DONG_VAN',
    name: 'KCN Đồng Văn, Duy Tiên, Hà Nam',
    address: 'Đồng Văn, Duy Tiên, Hà Nam',
    coords: { lat: 20.6273, lng: 105.9525 },
    province: 'Hà Nam',
  },

  // Nam Định
  ND_CENTRAL: {
    id: 'ND_CENTRAL',
    name: 'Trung tâm TP. Nam Định (Quảng trường 3-2)',
    address: 'Trần Phú, TP. Nam Định, Nam Định',
    coords: { lat: 20.4285, lng: 106.1685 },
    province: 'Nam Định',
    isMeetingPoint: true,
  },
  ND_BIG_C: {
    id: 'ND_BIG_C',
    name: 'Go! Nam Định (Nút giao Big C Nam Định)',
    address: 'Quốc lộ 10, Lộc Hòa, TP. Nam Định',
    coords: { lat: 20.4431, lng: 106.1418 },
    province: 'Nam Định',
    isMeetingPoint: true,
  },
  ND_Y_YEN: {
    id: 'ND_Y_YEN',
    name: 'Thị trấn Lâm, Ý Yên, Nam Định (Nút giao Cao Bồ)',
    address: 'Ý Yên, Nam Định',
    coords: { lat: 20.3582, lng: 106.0125 },
    province: 'Nam Định',
  },

  // Ninh Bình
  NB_CENTRAL: {
    id: 'NB_CENTRAL',
    name: 'TP. Ninh Bình (Quảng trường Đinh Tiên Hoàng)',
    address: 'Trần Hưng Đạo, TP. Ninh Bình',
    coords: { lat: 20.2528, lng: 105.9754 },
    province: 'Ninh Bình',
    isMeetingPoint: true,
  },
  NB_TRANG_AN: {
    id: 'NB_TRANG_AN',
    name: 'Khu du lịch sinh thái Tràng An / Bái Đính',
    address: 'Tràng An, Hoa Lư, Ninh Bình',
    coords: { lat: 20.2592, lng: 105.9125 },
    province: 'Ninh Bình',
  },
  NB_TAM_DIEP: {
    id: 'NB_TAM_DIEP',
    name: 'TP. Tam Điệp (Cửa ngõ vào Thanh Hóa)',
    address: 'Quốc lộ 1A, Tam Điệp, Ninh Bình',
    coords: { lat: 20.1481, lng: 105.8925 },
    province: 'Ninh Bình',
  },

  // Hải Phòng
  HP_CENTRAL: {
    id: 'HP_CENTRAL',
    name: 'Nhà hát lớn Hải Phòng, TP. Hải Phòng',
    address: 'Quang Trung, Hồng Bàng, Hải Phòng',
    coords: { lat: 20.8601, lng: 106.6823 },
    province: 'Hải Phòng',
    isMeetingPoint: true,
  },
  HP_VINCOM: {
    id: 'HP_VINCOM',
    name: 'Vincom Imperia Hải Phòng',
    address: 'Thượng Lý, Hồng Bàng, Hải Phòng',
    coords: { lat: 20.8712, lng: 106.6625 },
    province: 'Hải Phòng',
  },

  // Hải Dương
  HD_CENTRAL: {
    id: 'HD_CENTRAL',
    name: 'TP. Hải Dương (Nút giao Gia Lộc / Cao tốc HN-HP)',
    address: 'Nguyễn Lương Bằng, TP. Hải Dương',
    coords: { lat: 20.9382, lng: 106.3156 },
    province: 'Hải Dương',
    isMeetingPoint: true,
  },

  // Thanh Hóa
  TH_CENTRAL: {
    id: 'TH_CENTRAL',
    name: 'TP. Thanh Hóa (Tượng đài Lê Lợi / Big C)',
    address: 'Lê Lợi, TP. Thanh Hóa, Thanh Hóa',
    coords: { lat: 19.8067, lng: 105.7852 },
    province: 'Thanh Hóa',
    isMeetingPoint: true,
  },
  TH_SAM_SON: {
    id: 'TH_SAM_SON',
    name: 'Bãi biển Sầm Sơn, Thanh Hóa',
    address: 'Hồ Xuân Hương, Sầm Sơn, Thanh Hóa',
    coords: { lat: 19.7428, lng: 105.9082 },
    province: 'Thanh Hóa',
  },
};

export interface IRoutingProvider {
  calculateRoute(origin: Coordinates, destination: Coordinates, intermediateWaypoints?: Coordinates[]): Promise<RouteGeometry>;
  calculateDetour(
    originalPath: Coordinates[],
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<{
    detourKm: number;
    detourMinutes: number;
    optimizedPath: Coordinates[];
    waypointSequence: { point: Coordinates; type: 'origin' | 'pickup' | 'dropoff' | 'destination' }[];
  }>;
}

export class MockRoutingProvider implements IRoutingProvider {
  async calculateRoute(origin: Coordinates, destination: Coordinates, intermediateWaypoints: Coordinates[] = []): Promise<RouteGeometry> {
    const rawPoints = [origin, ...intermediateWaypoints, destination];
    const path = interpolatePolyline(rawPoints, 8);
    const distanceKm = calculatePathLength(path);
    // Average interprovincial express speed ~ 65 km/h + 10 mins base stop time
    const durationMinutes = Math.round((distanceKm / 65) * 60 + 10);

    return {
      distanceKm,
      durationMinutes,
      path,
    };
  }

  async calculateDetour(
    originalPath: Coordinates[],
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<{
    detourKm: number;
    detourMinutes: number;
    optimizedPath: Coordinates[];
    waypointSequence: { point: Coordinates; type: 'origin' | 'pickup' | 'dropoff' | 'destination' }[];
  }> {
    const origStart = originalPath[0];
    const origEnd = originalPath[originalPath.length - 1];
    const baseLength = calculatePathLength(originalPath);

    // Sequence: Origin -> (intermediate stops) -> Pickup -> Dropoff -> Destination
    const sequencedPoints = [origStart, pickup, dropoff, origEnd];
    const optimizedPath = interpolatePolyline(sequencedPoints, 6);
    const newLength = calculatePathLength(optimizedPath);

    const detourKm = Math.max(0, Number((newLength - baseLength).toFixed(2)));
    // Assume detour at city/suburb speed ~ 35 km/h
    const detourMinutes = Math.round((detourKm / 35) * 60 + 4);

    const waypointSequence = [
      { point: origStart, type: 'origin' as const },
      { point: pickup, type: 'pickup' as const },
      { point: dropoff, type: 'dropoff' as const },
      { point: origEnd, type: 'destination' as const },
    ];

    return {
      detourKm,
      detourMinutes,
      optimizedPath,
      waypointSequence,
    };
  }
}

// Singleton routing provider instance
export const routingProvider: IRoutingProvider = new MockRoutingProvider();
