import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useToast } from '../../contexts/ToastContext';
import { routeService } from '../../services/route-service/routeService';
import { priceService } from '../../services/price-service/priceService';
import type { RouteResponse, CityResponse } from '../../types/route-service/response';

export const useLandingPage = () => {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [cities, setCities] = useState<CityResponse[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RouteResponse[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [fromCityId, setFromCityId] = useState('');
  const [toCityId, setToCityId] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);
  const passengerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (passengerMenuRef.current && !passengerMenuRef.current.contains(e.target as Node)) {
        setShowPassengerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSwapCities = () => {
    const temp = fromCityId;
    setFromCityId(toCityId);
    setToCityId(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCityId || !toCityId) {
      showError('Vui lòng chọn điểm đi và điểm đến');
      return;
    }
    const params = new URLSearchParams();
    params.set('originCityId', fromCityId);
    params.set('destCityId', toCityId);
    if (date) params.set('date', date);
    if (passengers > 1) params.set('passengers', passengers.toString());
    if (tripType === 'round-trip') params.set('roundTrip', 'true');
    
    navigate(`${ROUTES.ROUTES}?${params.toString()}`);
  };

  // Load cities for search dropdowns
  useEffect(() => {
    routeService.getCities()
      .then(res => {
        const payload = res.data.result || res.data.data;
        const list = (payload as any)?.content || (Array.isArray(payload) ? payload : []);
        setCities(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        setLoadingPopular(true);
        const res = await routeService.getPopularRoutes();
        const payload = res.data.result || res.data.data;
        const content = (payload as any)?.content || (Array.isArray(payload) ? payload : []);
        if (content && content.length > 0) {
          // Take top 5 for the landing page
          const topRoutes = content.slice(0, 5);
          
          // Enhance with price service
          const enhancedRoutes = await Promise.all(
            topRoutes.map(async (route: any) => {
              try {
                const priceRes = await priceService.getPricingByRoute(route.id);
                const pricePayload = priceRes.data.result || priceRes.data.data;
                const tiers = pricePayload?.priceTiers;
                if (tiers && tiers.length > 0) {
                  const lowestPrice = Math.min(...tiers.map((t: any) => t.minPrice || t.basePrice));
                  route.basePrice = lowestPrice;
                }
              } catch (e) {
                // Keep fallback
              }
              return route;
            })
          );
          
          setPopularRoutes(enhancedRoutes);
        }
      } catch (error) {
        console.error('Failed to fetch popular routes', error);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularRoutes();
  }, []);

  return {
    cities,
    popularRoutes,
    loadingPopular,
    tripType,
    setTripType,
    fromCityId,
    setFromCityId,
    toCityId,
    setToCityId,
    date,
    setDate,
    passengers,
    setPassengers,
    showPassengerMenu,
    setShowPassengerMenu,
    passengerMenuRef,
    handleSwapCities,
    handleSearch,
    navigate,
    ROUTES
  };
};
