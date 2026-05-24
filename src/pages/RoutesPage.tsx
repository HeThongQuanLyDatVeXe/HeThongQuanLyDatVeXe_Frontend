import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { routeService } from '../services/route-service/routeService';
import type { CityResponse, RouteResponse, RouteStopPointResponse } from '../types/route-service/response';

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cities, setCities] = useState<CityResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [stopPointsMap, setStopPointsMap] = useState<Record<string, RouteStopPointResponse[]>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [originCityId, setOriginCityId] = useState(searchParams.get('originCityId') || '');
  const [destCityId, setDestCityId] = useState(searchParams.get('destCityId') || '');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    routeService.getCities()
      .then(res => {
        const p = res.data.result || res.data.data;
        setCities((p as any)?.content || (Array.isArray(p) ? p : []));
      })
      .catch(() => {});
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await routeService.getRoutes({ size: 200 });
      const p = res.data.result || res.data.data;
      const list: RouteResponse[] = (p as any)?.content || (Array.isArray(p) ? p : []);
      const active = list.filter(r => r.status === 'ACTIVE');
      setRoutes(active);

      // Load stop points for all routes in parallel
      const spEntries = await Promise.all(
        active.map(r =>
          routeService.getRouteStopPoints(r.id)
            .then(res => {
              const data = res.data.result || res.data.data;
              return [r.id, Array.isArray(data) ? data : []] as [string, RouteStopPointResponse[]];
            })
            .catch(() => [r.id, []] as [string, RouteStopPointResponse[]])
        )
      );
      setStopPointsMap(Object.fromEntries(spEntries));
    } catch {
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = routes.filter(r => {
    if (originCityId && r.originCityId !== originCityId) return false;
    if (destCityId && r.destinationCityId !== destCityId) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !r.name?.toLowerCase().includes(kw) &&
        !r.originCityName?.toLowerCase().includes(kw) &&
        !r.destinationCityName?.toLowerCase().includes(kw) &&
        !r.code?.toLowerCase().includes(kw)
      ) return false;
    }
    return true;
  });

  const fmtDuration = (m: number) => {
    if (!m) return '—';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h > 0 ? `${h}h${mm > 0 ? mm + 'p' : ''}` : `${mm}p`;
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <Header />
      <main className="pt-20">
        <div className="grain-overlay" />

        {/* Hero */}
        <section className="h-[260px] bg-[#1A1410] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F4600C22_0%,_transparent_70%)] opacity-60 pointer-events-none" />
          <div className="relative z-10 w-full max-w-container-max px-gutter text-center">
            <h1 className="typo-headline-lg text-on-primary mb-3">Tuyến đường</h1>
            <p className="typo-body-lg text-on-primary/70">Chọn tuyến đường để xem các chuyến xe hiện có</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Sidebar Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5">
              <h3 className="typo-headline-md text-on-surface">Bộ lọc</h3>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Tìm kiếm</span>
                <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tên tuyến, thành phố..."
                  className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface" />
              </div>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Điểm khởi hành</span>
                <select value={originCityId} onChange={e => setOriginCityId(e.target.value)}
                  className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface">
                  <option value="">Tất cả</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <span className="typo-label-caps mb-2 block text-outline">Điểm đến</span>
                <select value={destCityId} onChange={e => setDestCityId(e.target.value)}
                  className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface">
                  <option value="">Tất cả</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {(originCityId || destCityId || keyword) && (
                <button onClick={() => { setOriginCityId(''); setDestCityId(''); setKeyword(''); }}
                  className="w-full px-4 py-2 border border-outline/20 text-primary rounded-xl typo-label-caps hover:bg-primary hover:text-on-primary transition-all cursor-pointer text-center">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* Route List */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-md">
              <p className="typo-body-md text-on-surface-variant italic">
                {loading ? 'Đang tải...' : <>{filtered.length} tuyến đường</>}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[32px]">route</span>
                </div>
                <h4 className="typo-headline-md text-primary">Không tìm thấy tuyến đường</h4>
                <p className="typo-body-md text-on-surface-variant">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {filtered.map(route => (
                  <article key={route.id}
                    onClick={() => navigate(`/tuyen-duong/${route.id}/chuyen-xe`)}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary/50 hover:shadow-lg transition-all duration-300 p-5 cursor-pointer group">

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="typo-body-lg font-bold text-on-surface truncate">{route.name || `${route.originCityName} — ${route.destinationCityName}`}</h3>
                        <span className="typo-label-sm text-outline font-mono">{route.code}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-start">
                        <span className="typo-headline-sm text-primary font-bold">{route.originCityName}</span>
                        <span className="typo-label-sm text-outline-variant">Điểm đi</span>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-3">
                        <span className="typo-label-sm text-outline bg-surface-container-low px-3 py-0.5 rounded-full mb-1.5">
                          ~{fmtDuration(route.durationMinutes)}
                        </span>
                        <div className="flex items-center w-full">
                          <div className="w-2 h-2 rounded-full border-2 border-primary bg-white" />
                          <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60 -mx-0.5" />
                          <span className="material-symbols-outlined text-primary text-[16px] -mx-1">arrow_forward</span>
                          <div className="flex-1 h-px border-t-2 border-dashed border-outline-variant/60 -mx-0.5" />
                          <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="typo-headline-sm text-on-surface font-bold">{route.destinationCityName}</span>
                        <span className="typo-label-sm text-outline-variant">Điểm đến</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 typo-label-sm text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">straighten</span>
                          <span>{route.distanceKm ? `${route.distanceKm} km` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{fmtDuration(route.durationMinutes)}</span>
                        </div>
                      </div>
                      <span className="text-primary typo-label-caps font-bold group-hover:underline flex items-center gap-1">
                        Xem chuyến <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </span>
                    </div>

                    {/* Stop Points */}
                    {(() => {
                      const sp = stopPointsMap[route.id] || [];
                      const pickups = sp.filter(s => s.isPickup || s.type === 'PICKUP' || s.type === 'BOTH');
                      const dropoffs = sp.filter(s => s.isDropoff || s.type === 'DROPOFF' || s.type === 'BOTH');
                      if (pickups.length === 0 && dropoffs.length === 0) return null;
                      return (
                        <div className="mt-3 pt-3 border-t border-outline/10 space-y-1.5">
                          {pickups.length > 0 && (
                            <div className="flex items-start gap-1.5 typo-label-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-green-600 text-[14px] mt-0.5 shrink-0">location_on</span>
                              <span><span className="font-semibold text-green-700">Đón:</span> {pickups.map(p => p.stopPointName).join(', ')}</span>
                            </div>
                          )}
                          {dropoffs.length > 0 && (
                            <div className="flex items-start gap-1.5 typo-label-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-red-500 text-[14px] mt-0.5 shrink-0">flag</span>
                              <span><span className="font-semibold text-red-600">Trả:</span> {dropoffs.map(p => p.stopPointName).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
