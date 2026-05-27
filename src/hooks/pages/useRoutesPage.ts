import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { routeService } from '../../services/route-service/routeService';
import type { CityResponse, RouteResponse, RouteStopPointResponse } from '../../types/route-service/response';

export const useRoutesPage = () => {
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

  return {
    cities,
    routes,
    stopPointsMap,
    loading,
    originCityId,
    setOriginCityId,
    destCityId,
    setDestCityId,
    keyword,
    setKeyword,
    filtered,
    fetchRoutes
  };
};
