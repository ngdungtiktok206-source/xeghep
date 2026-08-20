import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, DriverRoute, MatchCandidate, PassengerRequest, Waypoint } from '../types';
import { MapPin, Navigation, Route, Layers, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface InteractiveRouteMapProps {
  candidate?: MatchCandidate | null;
  driverRoute?: DriverRoute | null;
  passengerRequest?: PassengerRequest | null;
  heightClass?: string;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  candidate,
  driverRoute,
  passengerRequest,
  heightClass = 'h-[420px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'osm' | 'clean'>('osm');

  const activeDriver = candidate?.driverRoute || driverRoute;
  const activePassenger = candidate?.passengerRequest || passengerRequest;

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        // Dynamic import of Leaflet to ensure browser-only runtime
        const L = (await import('leaflet')).default;

        if (!leafletMapRef.current) {
          // Initialize map centered at Northern Vietnam corridor (Hanoi - Ninh Binh)
          const map = L.map(mapContainerRef.current, {
            center: [20.65, 105.95],
            zoom: 9,
            zoomControl: true,
            attributionControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
          }).addTo(map);

          leafletMapRef.current = map;
          if (isMounted) setMapLoaded(true);
        }

        const map = leafletMapRef.current;
        if (!map) return;

        // Clear existing custom layers
        map.eachLayer((layer: any) => {
          if (!layer._url) {
            map.removeLayer(layer);
          }
        });

        if (!activeDriver) return;

        const bounds = L.latLngBounds([]);

        // 1. Draw Route Corridor Buffer (Translucent wide polygon)
        if (activeDriver.pathCoordinates.length > 1) {
          const corridorPoints = activeDriver.pathCoordinates.map((p) => [p.lat, p.lng] as [number, number]);
          
          // Outer corridor halo
          const corridorHalo = L.polyline(corridorPoints, {
            color: '#6366f1',
            weight: 32,
            opacity: 0.12,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // 2. Draw Driver Primary Route (solid indigo line)
          const driverPolyline = L.polyline(corridorPoints, {
            color: '#4f46e5',
            weight: 6,
            opacity: 0.9,
          }).addTo(map);

          driverPolyline.bindPopup(`<b>Tuyến tài xế: ${activeDriver.driver.name}</b><br/>${activeDriver.origin.name} → ${activeDriver.destination.name}`);

          corridorPoints.forEach((p) => bounds.extend(p));
        }

        // 3. Draw Detour / Optimized Path if available
        if (candidate && candidate.optimizedPath && candidate.optimizedPath.length > 0) {
          const detourPoints = candidate.optimizedPath.map((p) => [p.lat, p.lng] as [number, number]);
          const detourPolyline = L.polyline(detourPoints, {
            color: '#f59e0b',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.95,
          }).addTo(map);

          detourPolyline.bindPopup(`<b>Lộ trình tối ưu có đón/trả</b><br/>Độ lệch: +${candidate.detourKm} km (~${candidate.detourMinutes} phút)`);
          detourPoints.forEach((p) => bounds.extend(p));
        }

        // 4. Custom Marker Icons
        const createCustomIcon = (color: string, label: string) => {
          return L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span>${label}</span>
              </div>
            `,
            iconSize: [80, 30],
            iconAnchor: [40, 15],
          });
        };

        // Driver Origin & Destination Markers
        if (activeDriver.origin) {
          L.marker([activeDriver.origin.coords.lat, activeDriver.origin.coords.lng], {
            icon: createCustomIcon('#3b82f6', '🚗 Xuất phát'),
          })
            .addTo(map)
            .bindPopup(`<b>Xuất phát:</b> ${activeDriver.origin.name}`);
        }

        if (activeDriver.destination) {
          L.marker([activeDriver.destination.coords.lat, activeDriver.destination.coords.lng], {
            icon: createCustomIcon('#1e293b', '🏁 Điểm cuối'),
          })
            .addTo(map)
            .bindPopup(`<b>Điểm cuối:</b> ${activeDriver.destination.name}`);
        }

        // Passenger Pickup & Dropoff Markers
        if (activePassenger) {
          if (activePassenger.origin) {
            const pPickup = L.marker([activePassenger.origin.coords.lat, activePassenger.origin.coords.lng], {
              icon: createCustomIcon('#10b981', '🟢 Điểm đón'),
            })
              .addTo(map)
              .bindPopup(`<b>Điểm đón khách:</b> ${activePassenger.origin.name}<br/>Khách: ${activePassenger.passengerName}`);
            bounds.extend([activePassenger.origin.coords.lat, activePassenger.origin.coords.lng]);
          }

          if (activePassenger.destination) {
            const pDropoff = L.marker([activePassenger.destination.coords.lat, activePassenger.destination.coords.lng], {
              icon: createCustomIcon('#ef4444', '🔴 Điểm trả'),
            })
              .addTo(map)
              .bindPopup(`<b>Điểm trả khách:</b> ${activePassenger.destination.name}<br/>Khách: ${activePassenger.passengerName}`);
            bounds.extend([activePassenger.destination.coords.lat, activePassenger.destination.coords.lng]);
          }
        }

        // Fit map viewport to include all points
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (err) {
        console.warn('Mapbox/Leaflet render note:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [candidate, activeDriver, activePassenger]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Floating Map Legend & Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs max-w-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">
          <Route className="w-4 h-4 text-indigo-600" />
          <span>Bản đồ hành lang tuyến</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1.5 bg-indigo-600 rounded-full inline-block"></span>
            <span className="text-slate-700 font-medium">Tuyến tài xế chính (Cao tốc/QL)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3 bg-indigo-200 rounded-xs inline-block opacity-75"></span>
            <span className="text-slate-600">Hành lang tương thích (Corridor 2km)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-amber-500 rounded-full border-t border-dashed border-amber-600 inline-block"></span>
            <span className="text-amber-800 font-medium">Lộ trình rẽ đón/trả (Detour)</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-700">Điểm đón khách</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-2"></span>
            <span className="text-slate-700">Điểm trả</span>
          </div>
        </div>
      </div>

      {/* Bottom Route Metrics Strip */}
      {candidate && (
        <div className="absolute bottom-3 inset-x-3 z-10 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-lg text-indigo-200 font-semibold">
              Khớp tuyến: {candidate.routeCompatibility}%
            </div>
            <div>
              <span className="text-slate-400">Độ lệch phát sinh: </span>
              <strong className="text-amber-300 font-bold">+{candidate.detourKm} km</strong>
              <span className="text-slate-400 text-[11px]"> (~{candidate.detourMinutes} phút)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span>Tỷ lệ lấp đầy sau ghép:</span>
            <strong className="text-emerald-400 font-bold">{candidate.projectedFillRate}%</strong>
            <span className="text-slate-400">({candidate.newOccupiedSeats}/{candidate.driverRoute.vehicle.totalSeats} ghế)</span>
          </div>
        </div>
      )}
    </div>
  );
};
